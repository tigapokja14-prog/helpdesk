import { b as getTicketById, e as getRepliesByTicketId, u as updateTicketStatus } from '../../../chunks/sheets_CYpgwGqN.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ params }) => {
  try {
    const id = params.id;
    const ticket = await getTicketById(id);
    if (!ticket) {
      return new Response(JSON.stringify({ error: "Tiket tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const replies = await getRepliesByTicketId(id);
    return new Response(JSON.stringify({ ...ticket, replies }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[GET /api/tiket/:id]", err.message);
    return new Response(JSON.stringify({ error: "Gagal mengambil tiket" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const PATCH = async ({ params, request }) => {
  try {
    const adminToken = process.env.ADMIN_SECRET_TOKEN || process.env.ADMIN_SECRET_TOKEN;
    const authHeader = request.headers.get("Authorization") || "";
    const sentToken = authHeader.replace("Bearer ", "").trim();
    console.log("[PATCH] adminToken dari env:", adminToken);
    console.log("[PATCH] token dari request :", sentToken);
    if (!adminToken) {
      return new Response(JSON.stringify({ error: "ADMIN_SECRET_TOKEN tidak dikonfigurasi di server" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (sentToken !== adminToken) {
      return new Response(JSON.stringify({ error: "Token tidak valid, akses ditolak" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { status } = body;
    const validStatuses = ["Menunggu", "Dalam Proses", "Selesai", "Ditolak"];
    if (!status || !validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: `Status tidak valid. Pilih: ${validStatuses.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    await updateTicketStatus(params.id, status);
    return new Response(JSON.stringify({ success: true, status }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[PATCH /api/tiket/:id]", err.message);
    return new Response(JSON.stringify({ error: "Gagal memperbarui status", detail: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
