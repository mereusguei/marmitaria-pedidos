import { prisma } from "@/lib/db";
import { QRCodeSVG } from "qrcode.react";

function formatPrintItems(items: string) {
  return items
    .replace(/G com Duas Carnes/g, "G com 2 Misturas")
    .replace(/R\$ ([0-9]+)\.([0-9]{2})/g, "R$ $1,$2");
}

export default async function PrintPage(props: any) {
  const params = await props.params;
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
          <div className="customer">
            <p>{order.customer}</p>
            {order.phone && <p>{order.phone}</p>}
          </div>

          <hr />

          <pre>{formatPrintItems(order.items)}</pre>

          {order.notes && (
            <>
              <p className="obs">OBS: {order.notes.toUpperCase()}</p>
            </>
          )}

          <hr />

          <p className="total">
            Total: R$ {Number(order.total).toFixed(2).replace(".", ",")}
          </p>

          <p>Pagamento: {order.payment}</p>

          {order.changeFor && (
            <p>
              Troco para: R${" "}
              {Number(order.changeFor).toFixed(2).replace(".", ",")}
            </p>
          )}

          {order.address && (
            <>
              <hr />
              <p className="section-title">Endereço:</p>
              <p>{order.address}</p>
            </>
          )}

          {order.locationUrl && (
            <>
              <hr />
              <p className="section-title">Localização:</p>
              <div className="qr">
                <QRCodeSVG value={order.locationUrl} size={130} />
              </div>
            </>
          )}
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `window.onload = function() { window.print(); }`,
          }}
        />

        <style>{`
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
            color: #000;
            background: #fff;
            font-weight: 900;
          }

          .ticket {
            width: 280px;
            padding: 8px;
            font-size: 15px;
            font-weight: 900;
          }

          .customer {
            font-size: 17px;
            font-weight: 900;
          }

          pre {
            white-space: pre-wrap;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 15px;
            font-weight: 900;
            line-height: 1.35;
            margin: 0;
          }

          p {
            margin: 5px 0;
            font-weight: 900;
          }

          .obs {
            margin-top: 8px;
            font-size: 15px;
            font-weight: 900;
          }

          .total {
            font-size: 17px;
            font-weight: 900;
          }

          .section-title {
            font-size: 15px;
            font-weight: 900;
          }

          .qr {
            margin-top: 6px;
            text-align: center;
          }

          hr {
            border: none;
            border-top: 2px dashed #000;
            margin: 8px 0;
          }

          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
