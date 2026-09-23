async function test() {
  try {
    const res = await fetch("http://localhost:3000");
    console.log("Fetch result:", res.status, res.statusText);
    const text = await res.text();
    console.log("Body length:", text.length);
    console.log("Snippet:", text.slice(0, 200));
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}
test();
