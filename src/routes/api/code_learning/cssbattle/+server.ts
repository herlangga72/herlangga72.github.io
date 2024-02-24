export async function GET() {
  try {
    const response = await fetch('https://us-central1-cssbattleapp.cloudfunctions.net/getRank?token=&userId=qNR4pK80n9Mpl8jHsYC3ld6gNRH2');

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const products = await response.json();
    return new Response(JSON.stringify(products), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 });
  }
}
