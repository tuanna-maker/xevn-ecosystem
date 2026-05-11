async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

function isProtectedPush(command) {
  const c = String(command || "").toLowerCase().replace(/\s+/g, " ");
  const pushesMain = /git push( .*)? (origin )?(main|master)(\s|$)/.test(c) || /git push( .*)?:(main|master)(\s|$)/.test(c);
  const force = /git push( .*)?--force/.test(c) || /git push( .*)?-f(\s|$)/.test(c);
  return { pushesMain, force };
}

async function main() {
  try {
    const payload = await readStdinJson();
    const command = String(payload.command ?? "");
    const { pushesMain, force } = isProtectedPush(command);

    if (force && pushesMain) {
      process.stdout.write(
        JSON.stringify({
          permission: "deny",
          user_message: "Blocked: force push to protected branch is not allowed.",
          agent_message: "Use PR workflow. Never force-push protected branches."
        })
      );
      return;
    }

    if (pushesMain) {
      process.stdout.write(
        JSON.stringify({
          permission: "ask",
          user_message:
            "Protected branch push detected. Confirm this is intended and all PR/review/check requirements are met.",
          agent_message: "Prefer PR-based merge to protected branches."
        })
      );
      return;
    }

    process.stdout.write(JSON.stringify({ permission: "allow" }));
  } catch {
    process.stdout.write(JSON.stringify({ permission: "allow" }));
  }
}

main();
