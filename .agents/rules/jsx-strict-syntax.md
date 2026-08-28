---
name: jsx-strict-syntax
description: Strict escaping rules for JSX syntax to prevent build errors.
---

# JSX Strict Syntax Rule

When generating, modifying, or reviewing React JSX/TSX files, you MUST strictly adhere to the following syntax escaping rules to prevent compiler crashes (e.g., Vite/Babel "Unexpected token" errors):

1. **Escape Greater-than / Less-than in Text Nodes:** 
   - NEVER use raw `>` or `<` inside JSX text nodes (e.g. `<div> > 50% </div>` is STRICTLY FORBIDDEN).
   - ALWAYS escape them as `&gt;` and `&lt;` (e.g. `<div> &gt; 50% </div>`).

2. **Curly Braces Escaping:**
   - If you need to output literal `{` or `}`, wrap them in a string literal expression: `{"{"}` or `{"}"}`.

3. **Self-Closing Tags:**
   - Always ensure elements without children are properly self-closed (e.g., `<br />`, `<Input />`).

Failure to follow this rule will crash the user's development server.
