import { prisma } from "@/lib/db";
import { QRCodeSVG } from "qrcode.react";

export default async function PrintPage(props: any) {
  const params = await props.params; // 👈 ESSA LINHA É A CHAVE

  const id = Number(params?.id);

  if (!id || isNaN(id)) {
    return <p>ID inválido.</p>;
  }

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    return <p>Pedido não encontrado.</p>;
  }

  return (
    <html>
      <body>
        <div className="ticket">
          <h2>MARMITARIA</h2>
          <h1>Pedido #{order.id}</h1>

          <p><strong>Cliente:</strong> {order.customer}</p>

          <hr />

          <pre>{order.items}</pre>

          <hr />

          <p>Total: R$ {Number(order.total).toFixed(2)}</p>
          <p>{order.payment}</p>

          {order.locationUrl && (
            <>
              <QRCodeSVG value={order.locationUrl} size={120} />
            </>
          )}
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`
        }} />

        <style>{`
          body { font-family: monospace; }
          .ticket { width: 280px; padding: 10px; }
        `}</style>
      </body>
    </html>
  );
}