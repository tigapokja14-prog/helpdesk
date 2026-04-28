import { v2 } from 'cloudinary';
export { renderers } from '../../renderers.mjs';

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const POST = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) throw new Error("File tidak ditemukan");
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Tipe file tidak diizinkan. Gunakan PNG, JPG, PDF, atau DOC.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Ukuran file maksimal 10MB");
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;
    const result = await v2.uploader.upload(dataUri, {
      folder: "helpdesk-lampiran",
      resource_type: "auto",
      // auto detect: image/pdf/doc
      public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    });
    console.log("[upload] Berhasil upload ke Cloudinary:", result.secure_url);
    return new Response(JSON.stringify({
      fileName: file.name,
      fileUrl: result.secure_url
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[POST /api/upload] ERROR:", err.message);
    return new Response(JSON.stringify({
      error: "Gagal mengupload file",
      detail: err.message
    }), {
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
