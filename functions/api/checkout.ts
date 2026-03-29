import { createAuth } from "@/lib/auth";

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const auth = createAuth(env.DB);

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
    });
  }

  const userId = session.user.id;

  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return new Response(JSON.stringify({ error: "missing priceId" }), {
        status: 400,
      });
    }

    const stripeSecret = env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return new Response(
        JSON.stringify({
          error: "server misconfigured: missing stripe secret",
        }),
        { status: 500 },
      );
    }

    // use standard fetch for calling the stripe api
    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecret}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          success_url: `${env.FRONTEND_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${env.FRONTEND_URL}/account`,
          "payment_method_types[]": "card",
          mode: "subscription",
          "line_items[0][price]": priceId,
          "line_items[0][quantity]": "1",
          client_reference_id: userId, // this links the payment back to our user in D1
        }),
      },
    );

    const checkoutSession: any = await response.json();

    if (checkoutSession.error) {
      return new Response(
        JSON.stringify({ error: checkoutSession.error.message }),
        { status: 400 },
      );
    }

    return new Response(JSON.stringify({ url: checkoutSession.url }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
