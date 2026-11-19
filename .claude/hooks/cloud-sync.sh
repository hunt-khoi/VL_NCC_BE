#!/usr/bin/env bash
# Cloud sessions on claude.ai/code can start from a stale environment snapshot
# (HEAD at an old commit). Fast-forward the current branch to origin on start.
# Does nothing on local machines.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
branch=$(git branch --show-current 2>/dev/null)
[ -n "$branch" ] || exit 0
if ! git fetch -q origin "$branch" 2>/dev/null; then
  echo "[cloud-sync] git fetch failed; HEAD may be stale. Tell the user before editing."
  exit 0
fi
before=$(git rev-parse --short HEAD)
remote=$(git rev-parse --short "origin/$branch")
if git merge -q --ff-only "origin/$branch" >/dev/null 2>&1; then
  after=$(git rev-parse --short HEAD)
  if [ "$before" = "$after" ]; then
    echo "[cloud-sync] $branch is up to date at $after."
  else
    echo "[cloud-sync] $branch fast-forwarded $before -> $after (environment snapshot was stale)."
  fi
else
  echo "[cloud-sync] WARNING: local $branch ($before) cannot fast-forward to origin/$branch ($remote). Tell the user before committing or pushing."
fi
exit 0
