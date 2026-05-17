#!/usr/bin/env bash
set -euo pipefail

SESSION="dev-monitor"
WINDOW="docker"
API_SERVICE="${1:-api}"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  tmux attach -t "$SESSION"
  exit 0
fi

PANE_STATUS=$(tmux new-session -d -s "$SESSION" -n "$WINDOW" -P -F '#{pane_id}')
PANE_STATS=$(tmux split-window -h -t "$PANE_STATUS" -P -F '#{pane_id}')
PANE_LOGS=$(tmux split-window -v -t "$PANE_STATUS" -P -F '#{pane_id}')
PANE_ERRORS=$(tmux split-window -v -t "$PANE_STATS" -P -F '#{pane_id}')

tmux send-keys -t "$PANE_STATUS" \
  "watch -n 2 'docker ps --format \"table {{.Names}}\t{{.Status}}\t{{.Ports}}\"'" C-m

tmux send-keys -t "$PANE_STATS" \
  "docker stats" C-m

tmux send-keys -t "$PANE_LOGS" \
  "docker compose logs -f --tail=200 $API_SERVICE" C-m

tmux send-keys -t "$PANE_ERRORS" \
  "docker compose logs -f --tail=200 $API_SERVICE | grep -i --line-buffered 'error\|warn\|exception\|failed'" C-m

tmux select-layout -t "${SESSION}:${WINDOW}" tiled
tmux select-pane -t "$PANE_LOGS"

tmux attach -t "$SESSION"
