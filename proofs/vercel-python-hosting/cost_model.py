"""PROTOTYPE PROOF. The cost model for the hosting boundary.

The question the ticket asks includes "within latency/cost limits", so this turns the
measured numbers into what a month of traffic costs and what the $5 hard limit buys.

Inputs are either measured on this machine or published rates, and each is labelled.

Run: .venv/bin/python cost_model.py
"""

# Model rates. Published GPT-6 Luna Standard text rates, from
# docs/research/model-access.md.
PRICE_INPUT_PER_TOKEN = 0.10 / 1_000_000
PRICE_OUTPUT_PER_TOKEN = 0.50 / 1_000_000

# Token shape of one request. The parent ticket's illustrative figure: 4,000 input
# tokens (the system prompt plus the bundled CV knowledge) and 500 output tokens.
MODEL_INPUT_TOKENS = 4000
MODEL_OUTPUT_TOKENS = 500

# Vercel Fluid compute published rates.
CPU_RATE_PER_GB_SECOND = 0.0000185
MEMORY_RATE_PER_GB_SECOND = 0.0000025

# Measured on this machine: warm request overhead is 3.29 ms, and the whole request is
# ~2.5 s of which nearly all is waiting on the OpenAI API. CPU is billed only while
# computing, so the CPU term is small and the memory term covers the wall time.
CPU_SECONDS_PER_REQUEST = 0.05
MEMORY_GB = 2 / 1024
WALL_SECONDS = 2.5

# The monthly hard spend limit the owner set on the OpenAI project.
MONTHLY_BUDGET = 5.0


def main() -> None:
    model_cost = (
        MODEL_INPUT_TOKENS * PRICE_INPUT_PER_TOKEN
        + MODEL_OUTPUT_TOKENS * PRICE_OUTPUT_PER_TOKEN
    )
    fn_cost = (
        CPU_SECONDS_PER_REQUEST * CPU_RATE_PER_GB_SECOND
        + MEMORY_GB * WALL_SECONDS * MEMORY_RATE_PER_GB_SECOND
    )

    print("=== MODEL COST, the dominant cost ===")
    print(f"one request ({MODEL_INPUT_TOKENS} in / {MODEL_OUTPUT_TOKENS} out): ${model_cost:.6f}")
    print(f"requests before the ${MONTHLY_BUDGET:.0f}/month hard limit: {MONTHLY_BUDGET / model_cost:,.0f}")
    for count in (100, 1000, 5000):
        print(f"  {count:>6,} requests/month -> ${count * model_cost:>7.3f}")

    print()
    print("=== VERCEL FUNCTION COST, the secondary cost ===")
    print(f"one request (0.05s CPU, 2GB memory, {WALL_SECONDS}s wall): ${fn_cost:.8f}")
    print(f"that is {fn_cost / model_cost * 100:.4f}% of the model bill")
    print(f"10,000 requests/month of hosting: ${fn_cost * 10000:.3f}")

    print()
    print("=== READING ===")
    print("The model bill is the budget that matters. Hosting is four orders of")
    print("magnitude below it, so the hosting decision should be made on security,")
    print("latency and operational simplicity, not on Vercel cost.")
    print()
    print(f"At {MONTHLY_BUDGET:.0f}/month the hard limit allows roughly")
    print(f"{MONTHLY_BUDGET / model_cost:,.0f} requests, which is far more than a")
    print("portfolio site will see. The binding constraint is abuse, not legitimate")
    print("traffic, so the per-IP limits and the shared secret are what protect the")
    print("budget in practice.")


if __name__ == "__main__":
    main()
