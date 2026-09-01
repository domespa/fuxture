# Giochi EMBED

Metti qui la build statica dei giochi fatti con engine esterni
(Phaser, Godot HTML5, Unity WebGL, PICO-8...), una cartella per gioco:

```
public/embedded-games/
  nome-gioco/
    index.html
    assets/...
```

Poi nella dashboard (Giochi -> Nuovo Gioco):

- Tipo: `EMBED`
- Entry path: `nome-gioco/index.html`

Il gioco viene caricato in un iframe con `sandbox`, quindi non ha accesso
a cookie e localStorage del dominio principale.

Nota: usa solo giochi tuoi o con licenza chiara. Giochi presi da portali
di terze parti sono un rischio copyright e possono violare le policy dei
network pubblicitari.
