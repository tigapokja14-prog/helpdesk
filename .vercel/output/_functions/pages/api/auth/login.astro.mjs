import { l as loginAdmin } from '../../../chunks/sheets_CYpgwGqN.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Username dan password wajib diisi" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const admin = await loginAdmin(username, password);
    if (!admin) {
      return new Response(JSON.stringify({ error: "Username atau password salah" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionToken = Buffer.from(
      `${admin.username}|${admin.role}|${Date.now()}|${process.env.ADMIN_SECRET_TOKEN}`
    ).toString("base64");
    return new Response(JSON.stringify({
      success: true,
      token: sessionToken,
      nama: admin.nama,
      role: admin.role,
      username: admin.username
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err.message);
    return new Response(JSON.stringify({ error: "Gagal login", detail: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
