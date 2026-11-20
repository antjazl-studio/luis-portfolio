---
title: "Writing an AI agent loop by hand before using a framework"
summary: "How the AI assistant on this portfolio works: a hand-written loop with the openai SDK, why it sends the whole profile instead of using RAG and embeddings, guarantees moved from the prompt into code, and two ways my eval lied to me."
date: 2026-11-20
draft: true
---

When a recruiter asks the assistant on this portfolio what I have done with Azure, everything it says about me has to come from my profile. A model that guesses is a bug I cannot ship. One of its guesses was an email address built from my name.

I wrote the agent's loop by hand with the `openai` SDK and no framework, because I wanted to see what a framework hides before I start using one. Three rules came out of it that I would reuse. When the knowledge base is small, send all of it instead of retrieving pieces. Move every guarantee that matters out of the prompt and into code. Test your eval before you trust its score.

The agent runs on FastAPI behind the chat widget on this site, and the code is public in [portfolio-agent](https://github.com/antjazl-studio/portfolio-agent). How an AI agent works on this portfolio's repository is in [an earlier post](/blog/ai-agent-workflow-portfolio).

## The agent in 60 seconds

An agent is a loop. You send the conversation and a list of tools to the model. If the model asks for a tool, you run it and send the result back. You repeat until it answers in plain text or you reach a step limit.

This agent has two tools: `search_profile` and `get_contact_info`. The model is `deepseek/deepseek-v3.2`, picked through an environment variable so I can change it without touching code. The `openai` SDK talks to OpenRouter by changing only the base URL and the key, and FastAPI streams the answer to the widget as Server-Sent Events.

## What writing the loop by hand taught me

I got the message order wrong at first. The assistant message that requests the tools has to go into the history before the tool results, or the model cannot match results to requests. DeepSeek accepted my mistake. `gpt-5-nano` rejected it with a 400 error.

This is the loop code where that happens (trimmed):

```python
for step in range(1, MAX_STEPS + 1):
    ...
    if not tool_calls:
        messages.append({"role": "assistant", "content": step_text.strip()})
        yield {"type": "done"}
        return

    # The assistant turn that requested the tools MUST go into the history
    # before the tool results, or the model can't match results to requests.
    messages.append(
        {
            "role": "assistant",
            "content": step_text,
            "tool_calls": [...],
        }
    )
```

The conversation is a list of messages, and that list is the agent's memory. Every turn sends all of it again, so the cost grows with every question. The API is stateless: the widget keeps the conversation and sends up to 20 messages of up to 2,000 characters each.

Two limits are mandatory. I cap the loop at 6 steps and each reply at 800 output tokens, because a loop that never ends spends money.

The last lesson was a bug. Text the model wrote in the same turn as a tool call was silently dropped. I assume a framework would have handled that for me, but I have not used one yet, so I cannot say. A test now covers it.

## RAG and embeddings in 60 seconds, and why I skipped them

RAG stands for retrieval-augmented generation. Before the model answers, a program fetches the passages most relevant to the question from a larger body of text and puts them in the prompt. The model then answers from those passages instead of from memory.

The usual way to find relevant passages is embeddings. A model turns a piece of text into a list of numbers so that texts with similar meaning end up close together. You embed your documents once, embed each question when it arrives, and take the nearest passages.

This agent uses neither. I tried two versions of `search_profile`:

- Experiment 1a was a naive keyword search that returned the top three sections of the profile.
- Experiment 1b returned the whole profile on every call. The profile is 422 words, about 800 tokens according to a comment in the code.

In my evals, 1b did better on grounding. I also have a structural reason. To answer "Has Luis worked with Kubernetes?" with a no, the model has to see the whole profile. Retrieval returns what is similar to the question and silently misses what is absent.

Sending everything has a cost. The model sometimes called `search_profile` three times in one turn, which sent the same 800 tokens three times, so the result now goes into the conversation only once. The keyword version is still in `agent.py` as `search_profile_keyword`. I have not built a retrieval version with embeddings, so I cannot tell you how it would score on the same suite. I would add it when the knowledge base outgrows the context, and I would test the questions whose right answer is "it is not there".

## Moving guarantees from the prompt into code

In my targeted runs, the model skipped the tool and invented a plausible Gmail address built from my name in some answers. By my count that was 2 to 4 of 10 runs, and I did not save those runs. The first fix was to force the tool on the first step:

```python
tool_choice="required" if step == 1 else "auto",
```

With that line, the same targeted runs were clean 10 times out of 10, by my count. The second fix was an output guardrail in code. Every email and every link in an answer must be on an allowlist, and an answer that fails the check is replaced with a safe message that contains my real contact details.

Streaming made that harder, because you cannot take back text the visitor has already read. The guardrail has to see an email or link before any of it is shown, so text is released one sentence at a time. An email or a link never contains whitespace, so a whole one is always inside a single sentence (trimmed):

```python
SENTENCE_BOUNDARY = re.compile(r"[.!?:]\s+|\n")

class GuardedText:
    """Holds streamed text until a sentence is complete, then checks it."""
    ...
    def feed(self, delta: str) -> str:
        self.pending += delta
        boundaries = list(SENTENCE_BOUNDARY.finditer(self.pending))
        if not boundaries:
            return ""
        cut = boundaries[-1].end()
        ready, self.pending = self.pending[:cut], self.pending[cut:]
        return self._check(ready)
```

Two smaller fixes follow the same idea. Refusals used to be free text, and some of them offered help with skills that are not in my profile, so now there is one fixed refusal sentence. Provider failures are also handled in code. One eval call hung for 90 seconds and another ended in a crash. Now there is a 30-second timeout, SDK retries, one retry of the model call when the visitor has not seen any text yet, and a fixed fallback answer after that.

## The eval lied to me, twice

The evals use promptfoo. There are 13 cases, each run 3 times, so a full run is 39 answers. The agent is `deepseek/deepseek-v3.2`. The grader is Claude Haiku 4.5 at temperature 0, a different model from the one under test, and it works from written criteria.

The scores did not go up in a straight line. These are runs of the first 11-case suite, 33 answers each, from promptfoo's history:

| Run (local time) | Passed |
|---|---|
| 2026-11-10 16:46, first full run | 23 of 33 |
| 2026-11-10 17:20 | 27 of 33 |
| 2026-11-10 17:27 | 25 of 33 |
| 2026-11-10 17:31 | 19 of 33 |
| 2026-11-11 18:14 | 27 of 33 |
| 2026-11-12 09:17 | 31 of 33 |
| 2026-11-12 09:53 | 33 of 33 |

I put the 19 down to the grader, not to the agent. Later the 12-case suite scored 36 of 36 twice and the 13-case suite scored 38 of 39 twice. Two other runs scored zero because the infrastructure failed, so they say nothing about the agent.

The first lie was a perfect score. My safe fallback message contains my real email, so the check "the only email in an answer is the real one" passed even when the guardrail had fired. I had 36 of 36 while two of three answers in a case were degraded. The fix was a separate metric:

```yaml
    # The output guardrail is a safety net, not an answer. If it fires, the model
    # failed underneath, even when the safe answer would satisfy other assertions.
    - type: javascript
      value: "!output.startsWith(\"Sorry, I couldn't answer that reliably\")"
      metric: guardrail_clean
```

The second lie came from the grader, and it was wrong in both directions. It was too lenient: "usually replies the same day" passed. It was also too strict: "Kubernetes isn't in his profile" failed, and a plain refusal was flagged as leaking configuration. So I tested the grader. A second suite feeds 12 fixed answers through the same rubric, 7 that must fail and 5 that must pass. I re-run it whenever I change the rubric, and in its last run all 12 were classified as intended.

The grader costs tokens too. In the three latest full runs, grading used about three quarters of the tokens the agent used.

## What it costs and how fast it is

In the three latest full eval runs, an answer used on average between 2,190 and 2,400 input tokens and about 100 output tokens, across two model calls. The input dominates because the profile is sent again. At $0.25 in and $0.38 out per million tokens, the prices for `deepseek-v3.2` on OpenRouter when I chose it, that is about $0.0006 per answer, or roughly 1,600 answers per dollar (an estimate).

The API has layers of protection: CORS, a per-IP rate limit, a daily budget, and, in the design, a hard cap on the OpenRouter key as the last line. The code defaults are 10 requests per minute and 100 per day per IP, and a budget of $1 a day. The deployed values come from environment variables.

The budget exposed one more bug. Token usage was counted in a single global dictionary, so two visitors answered at the same moment would have mixed up their counts. The evals ask one question at a time and could not see it. Each request now has its own counter.

For latency I have two views, and the conditions matter. In the eval, with 4 requests in parallel, the median answer took between 21 and 27 seconds and the range was 10 to 46 seconds. On 2026-11-20 I timed 3 single requests to the production API with one question. The tool call appeared after 1.6 to 2.6 seconds, the first text after 2.4 to 3.5 seconds, and the answer finished after 5.0 to 8.0 seconds. Three requests are not a benchmark.

## What I would change, and what to copy

LangGraph is next. I have not used it yet, and the evals are how I will check that the move does not make anything worse. The eval results also live in promptfoo's history on my machine and not in the repository, so the numbers here are checkable only by me. I should commit a summary of every run.

If you are building a first agent that talks to the public, three things carried over from this project:

- If your knowledge base fits in the context, send all of it, and test questions whose correct answer is "it is not there".
- Move each guarantee that matters from the prompt into code: a forced tool call, an allowlist, one fixed refusal, caps on steps and tokens.
- Test your eval before you trust its score. Feed it fixed answers with known verdicts, and add a metric that tells you when your safety net fired.

I tested one model for real, `deepseek/deepseek-v3.2`, and `gpt-5-nano` only until it returned empty answers.
