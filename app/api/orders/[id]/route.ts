import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { status } = await request.json();

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Delete old Telegram message and send new one with updated status
    await sendStatusUpdateToTelegram(order);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to send status update to Telegram
async function sendStatusUpdateToTelegram(order: any) {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log("Telegram not configured, skipping notification");
      return;
    }

    // Delete old message if exists
    console.log("Order telegramMessageId:", order.telegramMessageId);
    if (order.telegramMessageId) {
      try {
        const deleteUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
        console.log("Attempting to delete message ID:", order.telegramMessageId);
        const deleteResponse = await fetch(deleteUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            message_id: parseInt(order.telegramMessageId),
          }),
        });
        const deleteResult = await deleteResponse.json();
        console.log("Delete response:", deleteResult);
        if (deleteResponse.ok) {
          console.log("✅ Old Telegram message deleted successfully");
        } else {
          console.log("❌ Failed to delete message:", deleteResult);
        }
      } catch (err) {
        console.log("Could not delete old message:", err);
      }
    } else {
      console.log("⚠️ No previous message ID found - this is the first message");
    }

    const getPaymentMethodLabel = (method: string) => {
      const methods: { [key: string]: string } = {
        credit_card: "Credit Card",
        paypal: "PayPal",
        bank_transfer: "Bank Transfer",
        cash_on_delivery: "Cash on Delivery",
      };
      return methods[method] || method;
    };

    const message = `
🔔 *STATUS UPDATED* 🔔
══════════════════════════════
✨ *E-Commerce Store* ✨

📍 *ORDER #${order.id.substring(0, 8).toUpperCase()}*

┌──────────────────────────────
│  📅 *${new Date(order.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}* at ${new Date(order.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}
│  ⚡ Status: *${order.status.toUpperCase()}* 🎯
│  💳 Payment: *${getPaymentMethodLabel(order.paymentMethod)}*
└──────────────────────────────

👤 *CUSTOMER*
• ${order.user?.name || 'Customer'}
• \`${order.user?.email || 'N/A'}\`

🛍️ *ITEMS*
${order.orderItems.map((item: any, index: number) => 
  `${index + 1}\. *${item.product.name}*
   ${item.quantity}x × $${item.price.toFixed(2)} = *$${(item.quantity * item.price).toFixed(2)}*`
).join('\n\n')}

──────────────────────────────
💰 *TOTAL*

  Subtotal:  $${order.total.toFixed(2)}
  Tax (0%):  $0.00
  ────────────────────────
  💎 *GRAND TOTAL: $${order.total.toFixed(2)}*

══════════════════════════════
✅ *Order status has been updated!* ✅
    `;

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
    
    // Store new message ID
    if (response.ok && data.result) {
      await prisma.order.update({
        where: { id: order.id },
        data: { telegramMessageId: data.result.message_id.toString() },
      });
      console.log("Status update sent to Telegram successfully");
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    // Don't throw error - just log it so order update still succeeds
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
