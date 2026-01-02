function humanizeError(error) {
  if (!error) return null;

  const msg = error.toLowerCase();

  if (msg.includes("enotfound")) {
    return "Domain tidak ditemukan (DNS lookup gagal)";
  }

  if (msg.includes("timeout")) {
    return "Koneksi timeout (server tidak merespons)";
  }

  if (msg.includes("econnrefused")) {
    return "Koneksi ditolak oleh server";
  }

  if (msg.includes("certificate")) {
    return "Masalah sertifikat SSL";
  }

  if (msg.includes("network")) {
    return "Gangguan jaringan";
  }

  return "Terjadi kesalahan saat menghubungi target";
}

module.exports = { humanizeError };
