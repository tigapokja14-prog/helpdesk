import { f as getAllTickets, h as createTicket } from '../../chunks/sheets_CYpgwGqN.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const tickets = await getAllTickets();
    return new Response(JSON.stringify(tickets), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[GET /api/tiket]", err);
    return new Response(JSON.stringify({ error: "Gagal mengambil data tiket" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, subject, category, priority, description, attachment } = body;
    if (!name || !email || !subject || !description) {
      return new Response(
        JSON.stringify({ error: "Field nama, email, subjek, dan deskripsi wajib diisi" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Format email tidak valid" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await createTicket({
      name,
      email,
      subject,
      category: category || "Lainnya",
      priority: priority || "Sedang",
      description,
      attachment: attachment || ""
    });
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[POST /api/tiket]", err);
    return new Response(JSON.stringify({ error: "Gagal membuat tiket" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
