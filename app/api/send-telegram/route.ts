import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, orderDetails } = await request.json();

    // Get Telegram Bot Token from environment variable
    const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json(
        { error: "Telegram configuration missing" },
        { status: 500 }
      );
    }

    // Format the receipt message with cool design
    const message = `
🎉 *ORDER CONFIRMED* 🎉
══════════════════════════════
✨ *E-Commerce Store* ✨

📍 *ORDER #${orderId.substring(0, 8).toUpperCase()}*

┌──────────────────────────────
│  📅 *${new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}* at ${new Date(orderDetails.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}
│  ⚡ Status: *${orderDetails.status.toUpperCase()}*
│  💳 Payment: *${orderDetails.paymentMethod}*
└──────────────────────────────

👤 *CUSTOMER*
• ${orderDetails.customerName}
• \`${orderDetails.customerEmail}\`

🛍️ *ITEMS*
${orderDetails.items.map((item: any, index: number) => 
  `${index + 1}\. *${item.name}*
   ${item.quantity}x × $${item.price.toFixed(2)} = *$${(item.quantity * item.price).toFixed(2)}*`
).join('\n\n')}

──────────────────────────────
💰 *TOTAL*

  Subtotal:  $${orderDetails.total.toFixed(2)}
  Tax (0%):  $0.00
  ────────────────────────
  💎 *GRAND TOTAL: $${orderDetails.total.toFixed(2)}*

══════════════════════════════
🎉 *Thank you for your purchase!* 🎉
    `;

    // Send message to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Telegram API error:", data);
      return NextResponse.json(
        { error: "Failed to send to Telegram" },
        { status: 500 }
      );
    }

    // Store the message ID in the order
    const messageId = data.result.message_id;
    await prisma.order.update({
      where: { id: orderId },
      data: { telegramMessageId: messageId.toString() },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Receipt sent to Telegram successfully!",
      messageId: messageId
    });

  } catch (error) {
    console.error("Send to Telegram error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
