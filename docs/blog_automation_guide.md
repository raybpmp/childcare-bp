# Managing Your Hybrid Workflow (CI/CD)

Now that you have an automated GitHub Action writing blog posts every day at 9 AM UTC, your relationship with your code changes slightly. You are now in a **CI/CD (Continuous Integration / Continuous Deployment)** environment.

Here is exactly how to manage it so your local computer and the "guy online" don't clash.

## 1. The Daily Sync (Crucial)
Because the bot commits new posts directly to GitHub, your local computer will be "behind" every single day. 

> [!IMPORTANT]
> **Rule #1:** Always run `git pull` before you start working.
> If you don't, and you try to `git push` your own changes later, GitHub will reject them because the bot added files you don't have yet.

## 2. The Deployment Chain
You no longer need to manually deploy when the bot runs. The "guy online" handles the full chain:
1. **The Bot Runs:** At the scheduled time, the `auto_blog.py` script executes on GitHub's servers.
2. **The Bot Commits:** It writes a new `.mdx` file and commits it back to your `main` branch.
3. **The Build & Deploy:** The GitHub Action automatically builds your Astro site and pushes it to Firebase hosting for you.

## 3. How to Test Changes Safely
If you want to change how the bot works (e.g., editing the prompt) without waiting until 9 AM:
1. **Edit locally:** Change `scripts/prompts/blog_agent_prompt.md`.
2. **Test locally:** Run `python scripts/auto_blog.py` to see if you like the output.
3. **Push to GitHub:** Once you `git push`, the "guy online" will use your new logic for the next scheduled run.

---

### Summary Checklist
- [ ] **Morning:** `git pull` (to get the bot's latest posts).
- [ ] **Mid-day:** Work as usual locally.
- [ ] **End of Day:** `git push` (to send your work to GitHub).
- [ ] **Verification:** Check the [Actions Tab](https://github.com/raybpmp/childcare-bp/actions) to see the bot's status.
