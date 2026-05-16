# Audit & Forensic Architecture

## Audit Engine

```txt
/audit-engine
  /immutable-log
  /admin-actions
  /forensic-replay
  /security-events
```

## Mandatory Logs
- Login activity
- Grade changes
- Attendance modification
- Financial transaction
- AI actions

## Rules
- Append-only logs
- No hard delete
- Time-signed events
