interface TransactionRequest {
  amount: number;
  type: "TOPUP" | "PURCHASE";
  description: string;
}

export class WalletDurableObject {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    if (url.pathname === "/balance") {
      const balance = await this.state.storage.get<number>("balance") || 0;
      return new Response(JSON.stringify({ balance }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/transaction" && method === "POST") {
      try {
        const body: TransactionRequest = await request.json() as any;
        const { amount, type } = body;

        return await this.state.blockConcurrencyWhile(async () => {
          let balance = await this.state.storage.get<number>("balance") || 0;

          if (type === "PURCHASE" && balance < amount) {
            return new Response(JSON.stringify({ error: "Insufficient balance" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const newBalance = type === "PURCHASE" ? balance - amount : balance + amount;
          await this.state.storage.put("balance", newBalance);

          return new Response(JSON.stringify({ success: true, newBalance }), {
            headers: { "Content-Type": "application/json" },
          });
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}
