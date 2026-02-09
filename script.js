function searchArtist() {
  const rawInput = document.getElementById("artistInput").value.trim();
  const result = document.getElementById("result");

  if (!rawInput) {
    alert("Masukkan nama band atau musisi!");
    return;
  }

  const sparqlQuery = `
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?label ?abstract ?genreName ?hometownName ?activeYear ?thumbnail
WHERE {
  ?artist rdf:type dbo:Band .
  ?artist rdfs:label ?label .
  FILTER(lang(?label) = "en")
  FILTER(CONTAINS(LCASE(?label), LCASE("${rawInput}")))

  OPTIONAL {
    ?artist dbo:abstract ?abstract .
    FILTER(lang(?abstract) = "en")
  }

  OPTIONAL {
    ?artist dbo:genre ?genre .
    ?genre rdfs:label ?genreName .
    FILTER(lang(?genreName) = "en")
  }

  OPTIONAL {
    ?artist dbo:hometown ?hometown .
    ?hometown rdfs:label ?hometownName .
    FILTER(lang(?hometownName) = "en")
  }

  OPTIONAL { ?artist dbo:activeYearsStartYear ?activeYear }
  OPTIONAL { ?artist dbo:thumbnail ?thumbnail }
}
LIMIT 1
`;

  const url =
    "https://dbpedia.org/sparql?query=" +
    encodeURIComponent(sparqlQuery) +
    "&format=json";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const item = data.results.bindings[0];

      if (!item) {
        result.style.display = "block";
        result.innerHTML = "<p>Band tidak ditemukan.</p>";
        return;
      }

      result.style.display = "block";
      result.innerHTML = `
        <div class="band-header">
          <img src="${item.thumbnail ? item.thumbnail.value : 'https://via.placeholder.com/180'}">
          <div class="band-name">${item.label.value}</div>
        </div>

        <div class="info-row">
          <span class="label">Deskripsi:</span><br>
          ${item.abstract ? item.abstract.value : "-"}
        </div>

        <div class="info-row">
          <span class="label">Genre:</span> ${item.genreName ? item.genreName.value : "-"}
        </div>

        <div class="info-row">
          <span class="label">Kota Asal:</span> ${item.hometownName ? item.hometownName.value : "-"}
        </div>

        <div class="info-row">
          <span class="label">Tahun Aktif:</span> ${item.activeYear ? item.activeYear.value : "-"}
        </div>
      `;
    })
    .catch(() => {
      result.style.display = "block";
      result.innerHTML = "<p>Gagal mengambil data dari DBpedia.</p>";
    });
}
