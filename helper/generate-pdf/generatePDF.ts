export const generatePDF = async (apiUrl: string, content: Object) => {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
    })
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    console.log("Url: ", url)
    window.open(url, '_blank');
}