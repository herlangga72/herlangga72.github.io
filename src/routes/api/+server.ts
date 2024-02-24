export async function GET() {
    try {  
      const products = {
        "code learning": "/api/code_learning/",
        "user": "/api/user/"
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
  