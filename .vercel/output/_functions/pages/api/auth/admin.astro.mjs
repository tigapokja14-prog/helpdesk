import { d as deleteAdmin, g as getAllAdmins, a as addAdmin } from '../../../chunks/sheets_CYpgwGqN.mjs';
export { renderers } from '../../../renderers.mjs';

function verifyToken(request) {
  const auth = request.headers.get("Authorization") ?? "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    return decoded.includes(process.env.ADMIN_SECRET_TOKEN ?? "");
  } catch {
    return false;
  }
}
const GET = async ({ request }) => {
  if (!verifyToken(request)) {
    return new Response(JSON.stringify({ error: "Akses ditolak" }), { status: 401 });
  }
  try {
    const admins = await getAllAdmins();
    const safe = admins.map(({ username, nama, role }) => ({ username, nama, role }));
    return new Response(JSON.stringify(safe), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
const POST = async ({ request }) => {
  if (!verifyToken(request)) {
    return new Response(JSON.stringify({ error: "Akses ditolak" }), { status: 401 });
  }
  try {
    const { username, password, nama, role } = await request.json();
    if (!username || !password || !nama) {
      return new Response(JSON.stringify({ error: "Username, password, dan nama wajib diisi" }), { status: 400 });
    }
    await addAdmin({ username, password, nama, role: role || "admin" });
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
const DELETE = async ({ request }) => {
  if (!verifyToken(request)) {
    return new Response(JSON.stringify({ error: "Akses ditolak" }), { status: 401 });
  }
  try {
    const { username } = await request.json();
    if (!username) {
      return new Response(JSON.stringify({ error: "Username wajib diisi" }), { status: 400 });
    }
    await deleteAdmin(username);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    DELETE,
    GET,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
