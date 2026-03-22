// functions/api/webhook.ts
// handles incoming stripe webhook events.

export async function onRequestPost(context: any) {
  const { request, env } = context;

  // in a real app, you MUST verify the stripe signature here using the webhook secret.
  // for now, we will focus on the logic.
  
  try {
    const event: any = await request.json();

    // we handle the 'checkout.session.completed' event.
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id; // this matches the userId we passed in checkout.ts
      const stripeCustomerId = session.customer;

      if (!userId) {
        return new Response("missing client_reference_id", { status: 400 });
      }

      // update the user record to 'pro' tier in D1.
      await env.DB.prepare(
        "update users set tier = 'pro', stripe_customer_id = ? where id = ?"
      )
      .bind(stripeCustomerId, userId)
      .run();

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
