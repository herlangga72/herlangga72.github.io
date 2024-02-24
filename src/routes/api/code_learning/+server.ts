export async function GET() {
    try {  
      const products = {
        "codewars": "/api/code_learning/codewars",
        "leetcode": "/api/code_learning/leetcode",
        "cssbattle": "/api/code_learning/cssbattle",
      };
      return new Response(JSON.stringify(products), {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 });
    }
  }
  