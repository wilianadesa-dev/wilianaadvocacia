export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    const response = await fetch(
      "https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": process.env.DATAJUD_KEY
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
