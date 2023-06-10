IMDb runner
==========================

Szczegóły wywołań:
https://pl.wikipedia.org/wiki/Szablon:IMDb

## Osobowe

✅ Biogramy (przerobione):

- https://www.imdb.com/name/nm0000040/
- {{IMDb|osoba|0000040|Stanley Kubrick}}
- search tpl: `https://pl.wikipedia.org/w/index.php?limit=${limit}&offset=${offset}&sort=last_edit_asc&search=insource%3A%27imdb.com%2Fname%27+insource%3A%2F%5C%5Bhttps%3F%3A%5C%2F%5C%2Fwww%5C.imdb%5C.com%5C%2Fname%5C%2Fnm%5B0-9a-z%5D%2B%5C%2F+%2F&title=Specjalna:Szukaj&profile=advanced&fulltext=1&ns0=1&ns6=1&ns8=1&ns10=1&ns14=1&ns100=1`;

✅ Nagrody – osoby:

- https://www.imdb.com/name/nm0000040/awards
- {{IMDb|osoba nagrody|0000040|Stanley Kubrick}}

## Tytułowe (filmy)

Wyszukiwanie?
```
insource:'imdb.com/title' insource:/\[https?:\/\/www\.imdb\.com\/title/
```
-> 2137

Do tytułów powinno być inne summary... Może do nagród też inne.

✅ Nagrody – filmy:
- https://www.imdb.com/title/tt0914387/awards
- {{IMDb|tytuł nagrody|0914387|Układy (Damages)}}

✅ Free mem.

✅ Zamykanie strony wyszukiwania.

❌Odcinki serialu:
- https://www.imdb.com/title/tt0389564/episodes
- {{IMDb|lista|0389564|4400}}
Nie, jest z sezonami: https://www.imdb.com/title/tt0084972/episodes?season=1

✅ jsbot: Ścieżka dźwiękowa i filmy (tytuł).

✅ jsbot: skipDiff

✅ jsbot: Dodanie `#jsbot-sk-done` z `data-changes="${changes}"`.

✅ Oczekiwanie na `#jsbot-sk-done` i ew. spr. dataset.changes (0/1).

✅ Wywołanie skipDiff w runnerze.

✅ Wykrywanie końca listy (wszystkie elementy ukryte).

✅ Ścieżka dźwiękowa:
- https://www.imdb.com/title/tt0094582/soundtrack
- {{IMDb|soundtrack|0094582|serialu ''Cudowne lata''}}

✅ Filmy (base):
- https://www.imdb.com/title/tt0172495/
- {{IMDb|tytuł|0172495|Gladiator}}

✅ PWA-like caching.

More agressive JS caching.

Filmy c.d.