# Team Runtime Sequence (Agent-Skill-Rule-Hook-Command)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant A as Agent
    participant R as Rules (.cursor/rules)
    participant S as Skills (.cursor/skills)
    participant C as Commands (Shell/Tool Calls)
    participant H as Hooks (.cursor/hooks)
    participant T as Team Logs (.cursor/team/*)

    U->>A: Request new task/module
    A->>R: Load alwaysApply governance rules
    A->>S: Select role/phase skills
    S-->>A: Workflow + output template guidance

    A->>C: Execute implementation/analysis commands
    C-->>A: Result (success/failure output)
    C-->>H: Emit events (postToolUse / afterShellExecution)

    alt Shell failure or incident pattern
        H->>T: Append incident queue + bus alert
        H-->>A: Incident context for PM dispatch
    else Matching analysis/review context
        H->>T: Append template reminder log
        H-->>A: Suggest PRD/SRS/ADR/Gate template
    end

    A->>C: Launch subagent(s) by role
    C-->>H: subagentStop event
    H->>T: Append handoff-quality checkpoint
    H-->>A: Follow-up reminder for required handoff fields

    A->>T: Update status/evidence artifacts
    A-->>U: Delivery update with evidence path
```

## Notes
- `Rules` are mandatory constraints.
- `Skills` are execution playbooks.
- `Hooks` are event-driven automation and audit.
- `Commands` are the actual actions performed by agents/tools.
