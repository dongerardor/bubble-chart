//data structure:
//tema, vibe, pergunta, indicador, M1, M2, M3, M4

const dataModel = class dataModel {
  constructor(_data) {
    this.rawData = _data;
    this.maxAmount = this.getMaxAmount(_data);

    this.radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 14])
      .domain([0, this.maxAmount]);

    this.months = ["M1", "M2", "M3", "M4"];
    this.selectedMonth = this.months[this.months.length - 1];

    this.allNodes = this.createNodes(_data, this.selectedMonth);
    this.currentNodes = this.allNodes;
  }

  createNodes(data, month) {
    //set month (set to last month if parameter not defined)
    if (month && this.months.includes(month)) {
      this.selectedMonth = month;
    } else {
      this.selectedMonth = this.months[this.months.length - 1];
    }

    //get month label
    const monthObj = CONST.months.find(item => item.name === this.selectedMonth);
    const { label: monthLabel } = monthObj;

    ///themes
    const arrThemes = [
      { name: 'T1', label: "1 - Informações sobre o Coronavírus" },
      { name: 'T2', label: "2 - Impacto do Corona na rotina" },
      { name: 'T3', label: " 3 - A Vida em quarentena" },
      { name: 'T4', label: "4 - A relação com Marcas" }
    ]

    const nodes = data.map((d, i) => {
      const theme = arrThemes.find(item => item.label === d.tema);

      return {
        id: i,
        tema: theme.name,
        temaLabel: theme.label,
        vibe: d.vibe,
        pergunta: d.pergunta,
        indicador: d.indicador,
        M1: parseFloat(d.M1),
        M2: parseFloat(d.M2),
        M3: parseFloat(d.M3),
        M4: parseFloat(d.M4),
        month: this.selectedMonth,
        monthLabel: monthLabel,
        radius: this.radiusScale(d[this.selectedMonth]),
        value: d[this.selectedMonth],
        x: Math.random() * CONST.width,
        y: Math.random() * CONST.height,
        active: true
      }
    });

    // sort them to prevent occlusion of smaller nodes.
    nodes.sort(function (a, b) { return b.value - a.value; });
    return nodes;
  }

  setResetNodes() {
    const updatedNodes = this.allNodes.map(item => ({
      ...item,
      active: true
    }));
    this.allNodes = updatedNodes;
    return updatedNodes;
  }

  setActiveNodes(nodes) {
    const activeNodesIds = nodes.map(item => item.id);
    const updatedNodes = this.allNodes.map(item => ({
      ...item,
      active: activeNodesIds.includes(item.id)
    }));
    this.allNodes = updatedNodes;
    return updatedNodes;
  }

  setNodesByBlockId(id) {
    if (isNaN(id)) {
      return setResetNodes();
    }

    const block = this.getBlockById(id);
    if (block) {
      const { indicadores } = block;
      const filteredNodes = this.allNodes.filter(item => {
        const { indicador } = item;
        return indicadores.includes(indicador);
      });

      const updatedNodes = this.setActiveNodes(filteredNodes);
      return updatedNodes;
      
    } else {
      console.log("Error, no block ID");
      return [];
    }
  }


  setMonth(month) {
    if (this.months.includes(month)) {
      this.selectedMonth = month;
      //get month label (DRY)
      const monthObj = CONST.months.find(item => item.name === month);
      const { label: monthLabel } = monthObj;

      const updatedNodes = this.allNodes.map(item => {
        const value = item[month];
        const radius = this.radiusScale(value);

        return {
          ...item,
          value,
          monthLabel,
          radius
        };
      });

      updatedNodes.sort(function (a, b) { return b.value - a.value; });
      this.allNodes = updatedNodes;
      return updatedNodes;
    }
  }

  getAllNodes() {
    return this.allNodes;
  }

  getNodes() {
    return this.currentNodes;
  }

  

  getMaxAmount(data) {
    const arrNums = data.map(item => {
      const arrValues = [item.M1, item.M2, item.M3, item.M4];
      return d3.max(arrValues.map(val => parseFloat(val)));
    });
    return d3.max(arrNums);
  }

  getBlockById(id) {
    const dataBlocks = this.getAllDataBlocks();
    const block = dataBlocks.find(item => item.id === id);
    return block;
  }

  getAllDataBlocks() {
    return [
      {
        "id": 0,
        "tema": "BUSCA_INFORMAÇÕES_CORONAVÍRUS",
        "info": "Novo termo, novos conhecimentos. Ao primeiro alerta sobre a chegada do novo coronavírus no Brasil, 100% dos brasileiros conectados se tornaram cientes sobre a doença. Desde março, 98% dos entrevistados afirmaram conhecer ao menos parte dos sintomas da Covid-19. Esse número se mantém constante mesmo com as incertezas e falta de previsões futuras para lidar com essa nova realidade.",
        "indicadores": [
          "Sabem o que é o Coronavírus (COVID-19)",
          "Conhecem todos os sintomas do Coronavírus (COVID-19 )",
          "Conhecem a maior parte dos sintomas do Coronavírus (COVID-19 )"
        ]
      },
      {
        "id": 1,
        "tema": "CONHECER_ALGUÉM_INFECTADO",
        "info": "Um vírus que está tão longe, mas tão perto. O risco de contrair novo coronavírus parecia algo distante para muitas pessoas. Mas em menos de duas semanas, 7% dos brasileiros entrevistados conheciam alguém com o diagnóstico confirmado. A cada semana esse percentual teve um crescimento acelerado e, no terceiro mês, 50% das pessoas das regiões Norte e Nordeste conheciam alguém que contraiu a doença. Os brasileiros que conhecem pessoas que tiveram a Covid-19 são mais engajadas com o tema e 74% buscam informações pelo menos uma vez por dia. Dos que não conhecem uma pessoa com o novo vírus, o número dos que pesquisam informações cai para 60,9%.",
        "indicadores": [
          "Conhecem pessoa(s) infectadas pelo Coronavírus que já tiveram confirmação",
          "Conhecem pessoa(s) pessoas com suspeita/casos em investigação de contaminação pelo Coronavírus",
          "Estão infectados pelo Coronavírus e já receberam confirmação do diagnóstico",
          "Podem estar infectados pelo Coronavírus, mas ainda não receberam confirmação do diagnóstico",
          "Não conhecem ninguém que pode estar infectado pelo Coronavírus"
        ]
      },
      {
        "id": 2,
        "tema": "BUSCA_INFORMAÇÕES_CORONAVÍRUS",
        "info": "A busca por novas informações. Com a rotina remota da quarentena, a busca por informações sobre o novo coronavírus foi diferente entre gerações. Entrevistados com idade entre 18 e 49 anos procuram entender mais sobre como é a disseminação da doença. Pessoas com mais de 50 anos buscam conhecimento sobre o tratamento e a cura. Os principais canais para chegar aos dados também variam. Apesar de a TV aberta liderar em todas as fases, pessoas entre 18 e 39 pesquisam informações sobre a pandemia via Google e redes sociais, enquanto as com mais de 40 anos têm como segunda fonte de conhecimento os canais de TV fechada.",
        "indicadores": [
          "Buscam informações sobre o Coronavírus em canais de TV aberta",
          "Buscam informações sobre o Coronavírus em sites de notícias",
          "Buscam informações sobre o Coronavírus em pesquisas no Google",
          "Buscam informações sobre o Coronavírus em Redes Sociais (Instagram, Facebook, Twitter, etc)",
          "Buscam informações sobre o Coronavírus em canais de TV fechada (assinaturas)",
          "Buscam informações sobre o Coronavírus no YouTube",
          "Buscam informações sobre o Coronavírus em serviços de Streaming (Ex: Globoplay)",
          "Buscam informações sobre o Coronavírus em outros canais (rádio, jornais, sites do governo, sites especializados etc)"
        ]
      },
      {
        "id": 3,
        "tema": "CONTEXTO_POLÍTICO_IMPACTOS",
        "info": "Velha política x nova pandemia. No início da pandemia no Brasil, houve um crescimento pelas buscas de conteúdo específico sobre os cenários político e econômico em decorrência do novo coronavírus. Esse interesse não se manteve ao longo do estudo e a busca por conteúdos de entretenimento continua liderando esse ranking até hoje. Dentro da categoria entretenimento, o destaque fica com os shows, que tiveram crescimento de 100% entre a primeira e a última onda do estudo.",
        "indicadores": [
          "Têm buscado mais conteúdo de filmes",
          "Têm buscado mais conteúdo de séries",
          "Têm buscado mais conteúdo de humor (stand up, paródia, pegadinha, memes, zueira, etc..)",
          "Têm buscado mais conteúdo de novelas",
          "Têm buscado mais conteúdo de entrevistas",
          "Têm buscado mais conteúdo de Reality Shows",
          "Têm buscado mais conteúdo de ultimas notícias",
          "Têm buscado mais conteúdo de ciências e tecnologia",
          "Têm buscado mais conteúdo de política",
          "Têm buscado mais conteúdo de economia e negócios",
          "Têm buscado mais conteúdo de novidades e lançamentos de produtos",
          "Têm buscado mais conteúdo de ecologia, meio ambiente e consumo consciente",
          "Têm buscado mais conteúdo de Games",
          "Têm buscado mais conteúdo de Esportes",
          "Têm buscado mais conteúdo de Futebol (jogos, debate e resultados)",
          "Têm buscado mais conteúdo de Música",
          "Têm buscado mais conteúdo de Shows",
          "Têm buscado mais conteúdo de vídeos de como fazer/ aprender",
          "Têm buscado mais conteúdo de gastronomia, Culinária e receitas de cozinha",
          "Têm buscado mais conteúdo de educação/capacitação (Videoaulas)",
          "Têm buscado mais conteúdo de moda e beleza",
          "Têm buscado mais conteúdo infantil",
          "Têm buscado mais conteúdo de relacionamento",
          "Têm buscado mais conteúdo Adulto (XXX)"
        ]
      },
      {
        "id": 4,
        "tema": "SENTIMENTOS_E_EMOÇÕES",
        "info": "Novas emoções. Ansiedade é um estado de agitação já conhecido para a maioria dos brasileiros entrevistados neste estudo. Metade deles percebeu uma piora desse sentimento, somado a um novo, o medo, causado pelo novo coronavírus. ",
        "indicadores": [
          "Não têm nenhum medo em relação a tudo o que tem escutado/lido",
          "Não tenho muito medo em relação a tudo o que tem escutado/lido",
          "Não têm medo em relação a tudo o que tem escutado/lido",
          "Têm medo em relação a tudo o que tem escutado/lido",
          "Tenho muito medo em relação a tudo o que tem escutado/lido",
          "Sentem-se entediados",
          "Sentem-se preocupados",
          "Sentem-se incertos",
          "Sentem-se esperançosos",
          "Sentem-se com medo ",
          "Sentem-se ansiosos",
          "Sentem-se motivados",
          "Sentem-se tranquilos",
          "Sentem-se tristes",
          "Não sabem como se sentem",
          "Se consideram muito ansiosos",
          "Se consideram muito ansiosos",
          "Se consideram pouco anciosos",
          "Se consideram nada ansiosos",
          "Se consideram nada ansiosos",
          "Nível de ansiedade aumentou",
          "Nível de ansiedade diminuiu",
          "Nível de ansiedade permanece o mesmo",
          "Não sabem dizer sobre o nível de ansiedade"
        ]
      },
      {
        "id": 5,
        "tema": "USO_DE_TECNOLOGIA",
        "info": "Nova relação com a tecnologia. A conexão se tornou fundamental desde os primeiros dias de confinamento. A tecnologia passou a ser a principal aliada para o consumo de conteúdo de entretenimento. O uso de tecnologia aumentou para 80% das pessoas e a percepção positiva sobre esse o aumento subiu ao longo dos meses, chegando a 52%.",
        "indicadores": [
          "Consideram que o uso da tecnologia aumentou (Aplicativos, sites, etc)",
          "Não consideram que o uso da tecnologia aumentou (Aplicativos, sites, etc)",
          "Consideram que o uso da tecnologia continua o mesmo (Aplicativos, sites, etc)",
          "O aumento no uso de tecnologia afeta de maneira positiva",
          "O aumento no uso de tecnologia não afeta ",
          "O aumento no uso de tecnologia afeta de maneira negativa"
        ]
      },
      {
        "id": 6,
        "tema": "USO_DE_TECNOLOGIA",
        "info": "A nova comunicação\nPara manter algum convívio social, as ligações telefônicas foram substituídas por comunicações via aplicativos de mensagens de texto e vídeo chamadas. Em três semanas, o Whatsapp assumiu o primeiro lugar como o app mais usado e foi lembrado por 78% das pessoas. ",
        "indicadores": [
          "Utilizam mensagens de texto para manter o contato social com as pessoas que precisam/ mais gostam ",
          "Utilizam vídeo chamadas para manter o contato social com as pessoas que precisam/ mais gostam",
          "Utilizam aplicativos de jogos com vídeo (ex. House Party) para manter o contato social com as pessoas que precisam/ mais gostam",
          "Ligações de telefone/aplicativo (voz)",
          "Ainda não sabem dizer quais meios utilizam para manter o contato social com as pessoas que precisam/ mais gostam",
          "Netflix é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Redes Sociais (Instagram, Facebook, Twitter, etc) são os aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Amazon Prime é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Globoplay é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "YouTube é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "WhatsApp é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Google é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Twitter é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Aplicativos de Relacionamento (Tinder,Grinder,Happn, etc) são os aplicativos/sites que tem utilizado com maior frequência nessa quarentena?"
        ]
      },
      {
        "id": 7,
        "tema": "",
        "info": "VIBES: CORONALOVE A redescoberta do companheirismo e da proximidade, mas também do conflito e da pressão do convívio forçado. A pandemia atualiza nossas capacidades de conviver com o outro.  ",
        "indicadores": [
          "Concordam totalmente que as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "Concordam que as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "São indiferentes se as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "Discordam que as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "Discordam totalmente que as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "A mudança de rotina impactou nos meus relacionamentos sociais (amigos/família)",
          "A mudança de rotina impactou nos meus relacionamentos românticos (namorados/maridos/encontros casuais)",
          "Conversam com familiares e amigos online para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com as pessoas da minha casa para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com familiares e amigos online para lidar com o tédio ",
          "Conversam com as pessoas da minha casa para lidar com o tédio ",
          "falam com maior frequência com os seus amigos/familiares",
          "Falamos com a mesma frequência com os seus amigos/familiares",
          "Não estão se comunicando muito com os seus amigos/familiares",
          "Não costumam me comunicar online com os seus amigos/familiares",
          "Conversam/Batem papo online com os seus amigos",
          "Jogam online com os seus amigos",
          "Veem vídeos online com os seus amigos",
          "Usam o whatsapp com os seus amigos",
          "Entram nas redes Sociais com os seus amigos",
          "Fazem chamadas online com os seus amigos",
          "Encontrar amigos e familiares é o hábito que tinha e mais sente falta",
          "Começou a econtrar amigos e familiares durante a quarentena",
          "Conversar com amigos/família online é a parte mais esperada do dia",
          "Pretendem ver/ visitar familiares/amigos quando a quarentena acabar",
          "Falar mais com amigos/ família através de alguma ferramenta online pode passar a fazer parte da vida",
          "Buscam em aplicativos de relacionamento, conversar com alguém sem pretensões futuras",
          "Buscam em aplicativos de relacionamento, um alívio para a solidão ",
          "Buscam em aplicativos de relacionamento, marcar encontros durante o período de quarentena",
          "Buscam em aplicativos de relacionamento, um relacionamento casual durante a quarentena sem um encontro",
          "Buscam em aplicativos de relacionamento, um relacionamento casual pós quarentena",
          "Buscam em aplicativos de relacionamento, um relacionamento sério pós quarentena ",
          "Não sabem o que buscam em aplicativos de relacionamento",
          "Têm buscado mais conteúdo de relacionamento",
          "Conseguiram manter o relacionamento com a família, mesmo durante a quarentena "
        ]
      },
      {
        "id": 8,
        "tema": "QUARENTENA_TOTAL_PARCIAL",
        "info": "Nos isolamos. Mas por que mesmo? \nO isolamento aconteceu. O número de pessoas em distanciamento social no início da pandemia era de 36,7%, mas teve uma queda de mais de 50% ao longo dos meses. Do total de entrevistados, 29% estava em isolamento por acreditar na responsabilidade sobre a disseminação da doença. E é por motivos financeiros que 27% das pessoas não fazem o isolamento. ",
        "indicadores": [
          "Estão isolados pois acreditam ter responsabilidade sobre a disseminação da doença",
          "Estão isolados para proteger seus entes queridos",
          "Estão isolados por determinação das Autoridades/Governo?",
          "Evitam sair de casa, mas não estão isolado(a) por motivos econômicos/financeiros ",
          "Evitam sair de casa, mas acreditam que o cenário não é tão grave quanto se noticia",
          "Mantém convívio social normalmente por opção "
        ]
      },
      {
        "id": 9,
        "tema": "EMPREGO_E_RENDA",
        "info": "O home office improdutivo. Para 57% dos entrevistados que estão em isolamento social, a principal mudança foi a rotina profissional. O home office é a realidade de 61% das pessoas que estão em quarentena, sendo a primeira vez que 16% trabalham nessa dinâmica. 30% trabalham sob um regime informal. Nas primeiras semanas de março, as buscam relacionadas ao termo em inglês “home office” aumentaram 1000%: as principais pesquisas no campo de busca eram “home office significado” e “home office tradução”. Mas a procura passou a refletir as implicações da pandemia no Brasil e o termo “home office” passou a ser acompanhado de palavras como “trabalho” e “vagas” que, nos dois casos, tiveram um crescimento de 100%. Com o passar dos meses, a sensação de produtividade do brasileiro cai e 27% dos entrevistados em home office não se sentem produtivos (vs. 14% na primeira semana). ",
        "indicadores": [
          "Estão trabalhando em casa",
          "Estão indo para o trabalho normalmente",
          "Estão indo para o trabalho, mas a empresa vai liberar para trabalhar em casa?",
          "Sentem-se mais produtivo(a)",
          "Sentem-se um pouco mais produtivos",
          "Não sentem diferença na produtividade",
          "Sentem-se menos produtivos",
          "Não se sentem nada produtivos",
          "Estão trabalhando em casa pela primeira vez"
        ]
      },
      {
        "id": 10,
        "tema": "EMPREGO_E_RENDA",
        "info": "Novos hábitos diários. Os impactos na rotina profissional, com grande destaque no início da quarentena, cederam lugar por interesses como hábitos de higiene, deslocamentos e relacionamentos. A maior alteração na rotina foi o uso de máscara, citado por 71% dos entrevistados.",
        "indicadores": [
          "Limpeza de casa é uma atividade da rotina que foi alterada",
          "Preparo de alimentos (refeições) é uma atividade da rotina que foi alterada",
          "Tempo de sono é uma atividade da rotina que foi alterada",
          "Rotina profissional foi alterada",
          "Relacionamento com a família foi alterado",
          "Deslocamento (mobilidade) é uma atividade da rotina que foi alterada",
          "Atividades Físicas são atividades da rotina que foram alteradas",
          "Uso de máscaras no dia a dia é uma atividades da rotina que foi alterada"
        ]
      },
      {
        "id": 11,
        "tema": "AMBIENTE_DOMÉSTICO_CASA",
        "info": "Nova realidade e mudanças de imóveis. Por passar mais tempo em casa, as pessoas começam a perceber a necessidade de um ambiente doméstico diferente para o futuro. As buscas por decoração e design de interiores tiveram 86% de crescimento. As pesquisas também demonstram interesse em novos imóveis. O resultado pode indicar uma necessidade em razão do desemprego e diminuição de renda. Com menor condição financeira, há maior busca por imóveis que sustentem a atual realidade dos que sofreram mais as consequências econômicas da quarentena. ",
        "indicadores": [
          "Dados Google sem indicadores diretos."
        ]
      },
      {
        "id": 12,
        "tema": "AMBIENTE_DOMÉSTICO_CASA",
        "info": "VIBES: REDESCOBERTA DO LAR A quarentena impulsiona uma redescoberta do ambiente doméstico: redecorar, repensar, reformar ou mesmo se mudar — vale tudo para transformar a casa em um novo lar.",
        "indicadores": [
          "Conseguiram manter a limpeza da casa, mesmo durante a quarentena",
          "Limpeza de casa é uma atividade da rotina que foi alterada",
          "Não são os responsáveis pelas atividades de casa",
          "Compartilham as atividades de casa com outras pessoas que moram junto",
          "Existem pessoas em casa que realizam o serviços de rotina? (Limpeza, cozinha, jardinagem, etc)",
          "Não existem pessoas em casa que realizam o serviços de rotina? (Limpeza, cozinha, jardinagem, etc)",
          "Reparos necessários na casa foi sua principal \"descoberta\" nesse período",
          "Passar mais tempo em casa foi o principal efeito positivo dessa quarentena ",
          "Têm consumido mais produtos de limpeza pra casa",
          "Limpar a casa mais frequentemente foi uma alteração da sua rotina de higiene pessoal",
          "Trabalhar de casa pode passar a fazer parte da vida",
          "Fazer mais as atividades domésticas (limpeza, comida etc) pode passar a fazer parte da vida",
          "Têm buscado mais conteúdo de vídeos de como fazer/ aprender"
        ]
      },
      {
        "id": 13,
        "tema": "AMBIENTE_DOMÉSTICO_CASA",
        "info": "Novo olhar para o lar. O momento é de identificação com o lar. As mudanças que impactaram mais de 40% dos brasileiros conectados foram as tarefas domésticas - como maior frequência de limpeza das casas (53%) e lavagem de roupas (52%). Mas não são atividades que os entrevistados gostariam de manter após o fim da quarentena: apenas 5,2% dizem que vão incorporar esses hábitos após o isolamento. ",
        "indicadores": [
          "Limpeza de casa é uma atividade da rotina que foi alterada",
          "Preparo de alimentos (refeições) é uma atividade da rotina que foi alterada",
          "Tempo de sono é uma atividade da rotina que foi alterada",
          "Rotina profissional foi alterada",
          "Relacionamento com a família foi alterado",
          "Deslocamento (mobilidade) é uma atividade da rotina que foi alterada",
          "Atividades Físicas são atividades da rotina que foram alteradas",
          "Uso de máscaras no dia a dia é uma atividades da rotina que foi alterada",
          "Alteraram a sua rotina de higiene pessoal",
          "Não alteraram a sua rotina de higiene pessoal",
          "Lavar as mãos mais vezes ao dia foi uma alteração da sua rotina de higiene pessoal",
          "Lavar roupas mais frequentemente foi uma alteração da sua rotina de higiene pessoal",
          "Limpar a casa mais frequentemente foi uma alteração da sua rotina de higiene pessoal",
          "Usar alcool em gel frequentemente foi uma alteração da sua rotina de higiene pessoal",
          "Usar máscara de proteção facial industrializada foi uma alteração da sua rotina de higiene pessoal",
          "Usar mascara de proteção feita em casa foi uma alteração da sua rotina de higiene pessoal",
          "Tomar banho mais vezes ao dia foi uma alteração da sua rotina de higiene pessoal",
          "Deixar os calçados fora de casa foi uma alteração da sua rotina de higiene pessoal",
          "Não sabem qual foi a alteração da sua rotina de higiene pessoal"
        ]
      },
      {
        "id": 14,
        "tema": "HÁBITOS_DE_CONSUMO",
        "info": "Novos hábitos de consumo. O início da crise do novo coronavírus foi marcado pela correria aos supermercados, mas os resultados das pesquisas mostram que as compras de dispensa mantém o ritmo normal e a maior parte das pessoas não demonstrou o interesse em estocar mantimentos. O consumo de produtos em geral foi alterado aos poucos, mensalmente, principalmente entre as mulheres. No início da quarentena, as categorias ‘Higiene pessoal’ (56% no mês 1, vs. 46% no mês 3) e ‘Alimentos não perecíveis’ (46% mês 1 vs. 36% mês 3) foram as mais mencionadas sobre os produtos que os entrevistados passaram a consumir mais. Os brasileiros continuam comprando em super e hipermercados (78,8%). A opção por delivery cresce na quarentena principalmente entre as mulheres (46,7% na primeira semana vs. 59,3% na onda 12).",
        "indicadores": [
          "Foram ao mercado e fizeram uma compra mensal ",
          "Vão ao mercado apenas quando precisam",
          "Fizeram um estoque de compras suficiente para mais de um mês",
          "Fizeram o seu estoque de compras no dia da pesquisa",
          "Fizeram o seu estoque de compras dois dias antes da pesquisa",
          "Fizeram o seu estoque de compras na semana anterior a pesquisa",
          "Fizeram o seu estoque de compras nos 15 dias anteriores a pesquisaos",
          "Fizeram o seu estoque de compras no mês anterior a pesquisa",
          "Fizeram estoque de alimentos para 1 a 3 meses",
          "Fizeram estoque de alimentos para 3 a 6 meses",
          "Fizeram estoque de alimentos para +6 meses",
          "Decidiu por NÃO estocar alimentos, por não ter necessidade",
          "Decidiu por NÃO estocar alimentos, por falta de dinheiro",
          "Decidiu por NÃO estocar alimentos, pois precisa-se pensar no próximo",
          "Decidiu por NÃO estocar alimentos, por ter no mercado/não tem desabastecimento",
          "Decidiu por NÃO estocar alimentos, por estragar/Validade",
          "Decidiu por NÃO estocar alimentos, pois vai passar logo",
          "Decidiu por NÃO estocar alimentos, por não ter espaço",
          "Não sabe o motivo para decidir por NÃO estocar alimentos??Aumentaram o consumo (produtos em geral)",
          "Diminuiram o consumo (produtos em geral)",
          "Consumo permanece o mesmo (produtos em geral)",
          "Têm consumido mais alimentos congelados",
          "Têm consumido mais alimentos perecíveis",
          "Têm consumido mais alimentos não pereciveis ",
          "Têm consumido mais bebidas alcoolicas ",
          "Têm consumido mais bebidas não álcoolicas ",
          "Têm consumido mais produtos de higiene pessoal",
          "Têm consumido mais produtos de limpeza pra casa",
          "Têm consumido mais produtos de limpeza para carro",
          "Têm consumido mais medicamentos",
          "Têm consumido mais eletrônicos",
          "Têm consumido mais produtos de beleza",
          "Têm consumido mais suplementos alimentares (Vitamina C, vitamina D, polivitaminicos, etc)",
          "Têm consumido mais balas, chocolates e doces em geral ",
          "Têm consumido mais salgadinhos, amendoin e outros snacks ",
          "Têm consumido mais refeições do tipo Fast Food ??Fizeram compras em Lojas e mercadinhos de rua/Mercearias ",
          "Fizeram compras em Feiras e sacolões de bairro",
          "Fizeram compras em Super e hipermercados",
          "Fizeram compras em Aplicativos de delivery",
          "Fazem compras por Delivery",
          "Não fazem compras por Delivery"
        ]
      },
      {
        "id": 15,
        "tema": "BUSCA_INFORMAÇÕES_CORONAVÍRUS",
        "info": "Nova sensação de desinformação. A busca acelerada por respostas e informações sobre a Covid-19 que marcou o início do período de isolamento e as divergências no cenário político geraram sentimentos negativos aos brasileiros. A sensação era a de que não é possível ter informações suficientes a respeito do tema. A busca diária pelo termo “Coronavírus” no Google diminuiu a cada semana até retomar os índices anteriores ao período da quarentena, mostrando esse desinteresse.",
        "indicadores": [
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se preparados ",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se informados",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se seguros",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se confusos",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se impotentes",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se esperançosos",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se conformados",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), não sei sabem como se sentem??Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) mais de uma vez por dia",
          "Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) pelo menos uma vez por dia",
          "Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) 4 a 6 vezes por semana",
          "Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) 3 a 1 vez por semana",
          "Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) menos de uma vez por semana",
          "Não tem buscado informações sobre o coronavírus"
        ]
      },
      {
        "id": 16,
        "tema": "BUSCA_INFORMAÇÕES_CORONAVÍRUS",
        "info": "VIBES: INFOSTESIA Anestesiados, criamos anticorpos às notícias trágicas. Dessa forma, buscamos menos informações e adotamos verdades que são mais convenientes para cada um.",
        "indicadores": [
          "Estão acompanhando o aumento no número de casos de infestação pelo coronavírus",
          "Não estão acompanhando o aumento no número de casos de infestação pelo coronavírus",
          "Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) mais de uma vez por dia",
          "Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) pelo menos uma vez por dia",
          "Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) 4 a 6 vezes por semana",
          "Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) 3 a 1 vez por semana",
          "Acompanham/buscam informações sobre os casos de coronavírus (COVID-19) menos de uma vez por semana",
          "Não tem buscado informações sobre o coronavírus",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se preparados ",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se informados",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se seguros",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se confusos",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se impotentes",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se esperançosos",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), sentem-se conformados",
          "Quando buscam informações sobre o Coronavírus (COVID-19 ), não sei sabem como se sentem",
          "Frequência do consumo de informações e notícias após o coronavírus aumentou muito",
          "Frequência do consumo de informações e notícias após o coronavírus aumentou um pouco",
          "Frequência do consumo de informações e notícias após o coronavírus se manteve a mesma",
          "Frequência do consumo de informações e notícias após o coronavírus diminuiu um pouco",
          "Frequência do consumo de informações e notícias após o coronavírus diminuiu muito",
          "Não têm nenhum medo em relação a tudo o que tem escutado/lido",
          "Não tenho muito medo em relação a tudo o que tem escutado/lido",
          "Não têm medo em relação a tudo o que tem escutado/lido",
          "Têm medo em relação a tudo o que tem escutado/lido",
          "Tenho muito medo em relação a tudo o que tem escutado/lido",
          "Sentem-se entediados",
          "Sentem-se preocupados",
          "Sentem-se incertos",
          "Sentem-se esperançosos",
          "Sentem-se com medo ",
          "Sentem-se ansiosos",
          "Sentem-se motivados",
          "Sentem-se tranquilos",
          "Sentem-se tristes",
          "Não sabem como se sentem",
          "Se consideram muito ansiosos",
          "Se consideram muito ansiosos",
          "Se consideram pouco anciosos",
          "Se consideram nada ansiosos",
          "Se consideram nada ansiosos",
          "Nível de ansiedade aumentou",
          "Nível de ansiedade diminuiu",
          "Nível de ansiedade permanece o mesmo",
          "Não sabem dizer sobre o nível de ansiedade",
          "Têm mudanças de humor com frequência",
          "Não têm mudanças de humor com frequência",
          "Não sabem dizer sobre mudanças de humor nesse período",
          "Têm se sentido mais entediados",
          "Têm se sentido igualmente entediados",
          "Têm se sentido menos entediados",
          "Não sabem dizer como sentem-se nesse período"
        ]
      },
      {
        "id": 17,
        "tema": "CREDIBILIDADE_DAS_INFORMAÇÕES",
        "info": "Nova credibilidade para a imprensa. Os brasileiros conectados querem ter informações confiáveis para entender o atual cenário. Até o terceiro mês de estudo, os dados transmitidos pelos órgãos estaduais eram considerados os de maior credibilidade, mas os órgão municipais assumiram essa posição de destaque no último mês. Mas não é só a confiança das informações divulgadas pelo governo que está em pauta, então, os interlocutores que conquistaram mais crédito com o público são os jornalistas, considerados como fonte confiável para 60% dos entrevistados.",
        "indicadores": [
          "Concordam totalmente que as informações passadas por JORNALISTAS condizem com a realidade da epidemia",
          "Concordam que as informações passadas por JORNALISTAS condizem com a realidade da epidemia",
          "Sentem-se indiferentes se as informações passadas por JORNALISTAS condizem com a realidade da epidemia",
          "Discordam que as informações passadas por JORNALISTAS condizem com a realidade da epidemia",
          "Discordo totalmente que as informações passadas por JORNALISTAS condizem com a realidade da epidemia",
          "Concordam totalmente que as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "Concordam que as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "São indiferentes se as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "Discordam que as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "Discordam totalmente que as informações passadas por AMIGOS/FAMILIARES condizem com a realidade da epidemia.",
          "Concordam totalmente que as informações passadas por AUTORIDADES DO GOVERNO MUNICIPAL condizem com a realidade da epidemia.",
          "Concordam  que as informações passadas por AUTORIDADES DO GOVERNO MUNICIPAL condizem com a realidade da epidemia.",
          "São indiferentes se as informações passadas por AUTORIDADES DO GOVERNO MUNICIPAL condizem com a realidade da epidemia.",
          "Discordam que as informações passadas por AUTORIDADES DO GOVERNO MUNICIPAL condizem com a realidade da epidemia.",
          "Discordam totalmente que as informações passadas por AUTORIDADES DO GOVERNO MUNICIPAL condizem com a realidade da epidemia.",
          "Concordam totalmente que as informações passadas por AUTORIDADES DO GOVERNO ESTADUAL condizem com a realidade da epidemia. ",
          "Concordam que as informações passadas por AUTORIDADES DO GOVERNO ESTADUAL condizem com a realidade da epidemia. ",
          "São indiferentes se as informações passadas por AUTORIDADES DO GOVERNO ESTADUAL condizem com a realidade da epidemia. ",
          "Discordam que as informações passadas por AUTORIDADES DO GOVERNO ESTADUAL condizem com a realidade da epidemia. ",
          "Discordam totalmente que as informações passadas por AUTORIDADES DO GOVERNO ESTADUAL condizem com a realidade da epidemia. ",
          "Concordam totalmente que as informações passadas por AUTORIDADES DO GOVERNO FEDERAL condizem com a realidade da epidemia. ",
          "Concordam que as informações passadas por AUTORIDADES DO GOVERNO FEDERAL condizem com a realidade da epidemia. ",
          "São indiferentes se as informações passadas por AUTORIDADES DO GOVERNO FEDERAL condizem com a realidade da epidemia. ",
          "Discordam que as informações passadas por AUTORIDADES DO GOVERNO FEDERAL condizem com a realidade da epidemia. ",
          "Discordam totalmente que as informações passadas por AUTORIDADES DO GOVERNO FEDERAL condizem com a realidade da epidemia."
        ]
      },
      {
        "id": 18,
        "tema": "SENTIMENTOS_E_EMOÇÕES",
        "info": "As novas oscilações de humor. 44,4% dos entrevistados sentem alterações de humor com frequência durante o isolamento, enquanto 39% afirmam não têm. As mulheres estão sofrendo mais neste período, 60% delas têm mudanças frequentes de humor, enquanto 37,5% dos homens relatam o mesmo sentimento. Para quem conhece uma pessoa infectada pelo vírus esse número é de 51,5% vs. 40,3% para quem não conhece. ",
        "indicadores": [
          "Têm mudanças de humor com frequência",
          "Não têm mudanças de humor com frequência",
          "Não sabem dizer sobre mudanças de humor nesse período"
        ]
      },
      {
        "id": 19,
        "tema": "RELACIONAMENTOS",
        "info": "Novos modos de se relacionar. Os relacionamentos amorosos sofreram um impacto para 17,5% das pessoas.  Os homens declaram terem sentido maior impacto durante a quarentena em seus relacionamentos, e foram os maiores usuários dos aplicativos de relacionamento (5,3%). ",
        "indicadores": [
          "A mudança de rotina impactou nos meus relacionamentos românticos (namorados/maridos/encontros casuais)",
          "Aplicativos de Relacionamento (Tinder,Grinder,Happn, etc) são os aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Buscam em aplicativos de relacionamento, conversar com alguém sem pretensões futuras",
          "Buscam em aplicativos de relacionamento, um alívio para a solidão ",
          "Buscam em aplicativos de relacionamento, marcar encontros durante o período de quarentena",
          "Buscam em aplicativos de relacionamento, um relacionamento casual durante a quarentena sem um encontro",
          "Buscam em aplicativos de relacionamento, um relacionamento casual pós quarentena",
          "Buscam em aplicativos de relacionamento, um relacionamento sério pós quarentena ",
          "Não sabem o que buscam em aplicativos de relacionamento"
        ]
      },
      {
        "id": 20,
        "tema": "SENTIMENTOS_E_EMOÇÕES",
        "info": "Novos impactos positivos para a cidade. Há impactos positivos neste período de pandemia na opinião dos brasileiros. Eles percebem a cidade mais tranquila, sem trânsito e com menor índice de poluição do ar. Atividades de rotina como deslocamento até o trabalho e se arrumar todos os dias ganham destaque no terceiro mês da pesquisa. ",
        "indicadores": [
          "Reparos necessários na casa foi sua principal \"descoberta\" nesse período",
          "Reinventar o convívio diário com a família foi sua principal \"descoberta\" nesse período",
          "Novas receitas foi sua principal \"descoberta\" nesse período",
          "Buscar formas de lidar com a ansiedade foi sua principal \"descoberta\" nesse período",
          "Funcionalidades da tecnologia (aprendeu a usar, ou passou usar melhor) foi sua principal \"descoberta\" nesse período",
          "Antigos \"hobbies\" foi sua principal \"descoberta\" nesse período",
          "Descobrir maneiras de se manter fisicamente ativo foi sua principal \"descoberta\" nesse período",
          "Solidariedade de vizinhos e da sua comunidade foi sua principal \"descoberta\" nesse período",
          "Auxiliar/Motivar as crianças nas atividades escolares em casa foi sua principal \"descoberta\" nesse período",
          "Não sabem qual foi sua principal \"descoberta\" nesse período",
          "Menos poluição no ar foi o principal efeito positivo dessa quarentena ",
          "Menor trânsito nas ruas foi o principal efeito positivo dessa quarentena ",
          "Passar mais tempo em casa foi o principal efeito positivo dessa quarentena ",
          "Ruas mais tranquilas (menor quantidade de pessoas) foi o principal efeito positivo dessa quarentena ",
          "Não ter que me arrumar todos os dias foi o principal efeito positivo dessa quarentena ",
          "Não ter que me deslocar até o trabalho foi o principal efeito positivo dessa quarentena ",
          "Não sabem qual foi o principal efeito positivo dessa quarentena"
        ]
      },
      {
        "id": 21,
        "tema": "CONSUMO_DE_ENTRETENIMENTO",
        "info": "Novo entretenimento: indoor. Para aliviar a ansiedade deste momento, o entretenimento indoor aparece principalmente no consumo de vídeos e séries. Quase 70% dos brasileiros conectados elegeram o Youtube como principal canal de busca para este conteúdo. Os homens foram os que mais utilizaram o app (73,18%).",
        "indicadores": [
          "Assistem Filmes/séries/Novelas/Documentários para lidar com a sua ansiedade e diminuir o stress ",
          "Assistidem vídeos no Youtube para lidar com a sua ansiedade e diminuir o stress ",
          "Utilizadam as redes sociais para lidar com a sua ansiedade e diminuir o stress ",
          "Leem (Livros, revistas, sites) para lidar com a sua ansiedade e diminuir o stress ",
          "Praticam jogos online para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com familiares e amigos online para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com as pessoas da minha casa para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com profissionais especializados online para lidar com a sua ansiedade e diminuir o stress ",
          "Realizam atividades físicas para lidar com a sua ansiedade e diminuir o stress ",
          "Meditam para lidar com a sua ansiedade e diminuir o stress ",
          "Práticam Yoga para lidar com a sua ansiedade e diminuir o stress ",
          "Realizam práticas religiosas (Orações) para lidar com a sua ansiedade e diminuir o stress ",
          "Realizam atividades manuais para lidar com a sua ansiedade e diminuir o stress ",
          "Fazem compras Online (Roupas, acessórios, eletrônicos, etc.) para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com familiares e amigos online para lidar com o tédio ",
          "Conversam com profissionais especializados online para lidar com o tédio ",
          "Conversam com as pessoas da minha casa para lidar com o tédio ",
          "Assistem vídeos no Youtube para lidar com o tédio ",
          "Realizam atividades físicas para lidar com o tédio ",
          "Realizam atividades manuais para lidar com o tédio ",
          "Assistem Filmes/séries/Novelas/Documentários para lidar com o tédio ",
          "Leem (Livros, revistas, sites) para lidar com o tédio ",
          "Utilizam as redes sociais para lidar com o tédio ",
          "Praticam jogos online para lidar com o tédio ",
          "Meditam para lidar com o tédio ",
          "Práticam Yoga para lidar com o tédio ",
          "Realizam práticas religiosas (Orações) para lidar com o tédio ",
          "Fazem compras Online (Roupas, acessórios, eletrônicos, etc.) para lidar com o tédio??Buscam conteúdo em Redes Sociais (Instagram, Facebook, Twitter, etc)",
          "Buscam conteúdo em Sites de notícias",
          "Buscam conteúdo em Pesquisas no Google",
          "Buscam conteúdo no YouTube",
          "Buscam conteúdo em Canais de TV aberta",
          "Buscam conteúdo em Canais de TV fechada (assinaturas)",
          "Buscam conteúdo em Serviços de Streaming (Ex: Globoplay)",
          "Buscam conteúdo no WhatsApp",
          "Buscam conteúdo no Twitter"
        ]
      },
      {
        "id": 22,
        "tema": "",
        "info": "VIBES: BOAS INFLUÊNCIAS Os bons exemplos são a vacina para uma cultura que está cansada de oportunismo e más influências.",
        "indicadores": [
          "Google Trens mostra que o termo cancelamento teve um primeiro pico no final de abril, e depois um crescimento ainda maior entre junho e julho."
        ]
      },
      {
        "id": 23,
        "tema": "",
        "info": "Novas frustrações. Estudar e praticar atividades físicas durante a quarentena são os planos ainda não realizados pelos brasileiros conectados. ",
        "indicadores": [
          "Têm algo que gostaria de fazer nessa quarentena que ainda não fez",
          "Não têm algo que gostaria de fazer nessa quarentena que ainda não fez",
          "61) O que você gostaria de fazer nessa quarentena que ainda não fez? "
        ]
      },
      {
        "id": 24,
        "tema": "PAPEL_DAS_MARCAS",
        "info": "Novo envolvimento com marcas. O envolvimento das marcas cai em comparação ao início da quarentena no Brasil, com maior intensidade entre as classes C1, C2 e D, apesar de se manter como algo essencial para 73% dos entrevistados. Com o prolongamento do cenário, há aumento no número de pessoas indiferentes aos posicionamentos (11% vs. 9% no mês 3). As principais ações descritas são doações e garantia de emprego aos funcionários.",
        "indicadores": [
          "Acho essencial e admirável a atuação de marcas para ajudar a sociedade",
          "Acho bom, mas não acredito que seja função de empresas e marcas ajudar a sociedade",
          "Sou indiferente a empresas e marcas ajudarem a sociedade",
          "Não acham que marcas deveriam atuar para ajudar a sociedade",
          "Não sabem dizer sobre a atuação demarcas para ajudar a sociedade",
          "Marcas e empresas podem ajudar fazendo doações",
          "Marcas e empresas podem ajudar na concientização",
          "Marcas e empresas podem oferecer produtos, insumos, estrutura",
          "Marcas e empresas podem ajudar não demitindo / dando férias remuneradas aos funcionários",
          "Marcas e empresas podem ajudar liberando o Home Office",
          "Marcas e empresas podem ajudar facilitando compra, pagamento, acesso aos produtos",
          "Marcas e empresas podem ajudar fazendo promoções/ Descontos/ Auxilio financeiro",
          "Não sabem como as empresas podem ajudar"
        ]
      },
      {
        "id": 25,
        "tema": "",
        "info": "VIBES: BRAND UTILITY Qual é a capacidade das empresas de serem úteis para ajudar a conter os danos da pandemia? A hora é de compromissos práticos e não discursos e campanhas. ",
        "indicadores": [
          "Acho essencial e admirável a atuação de marcas para ajudar a sociedade",
          "Acho bom, mas não acredito que seja função de empresas e marcas ajudar a sociedade",
          "Sou indiferente a empresas e marcas ajudarem a sociedade",
          "Não acham que marcas deveriam atuar para ajudar a sociedade",
          "Não sabem dizer sobre a atuação demarcas para ajudar a sociedade",
          "Marcas e empresas podem ajudar fazendo doações",
          "Marcas e empresas podem ajudar na concientização",
          "Marcas e empresas podem oferecer produtos, insumos, estrutura",
          "Marcas e empresas podem ajudar não demitindo / dando férias remuneradas aos funcionários",
          "Marcas e empresas podem ajudar liberando o Home Office",
          "Marcas e empresas podem ajudar facilitando compra, pagamento, acesso aos produtos",
          "Marcas e empresas podem ajudar fazendo promoções/ Descontos/ Auxilio financeiro",
          "Não sabem como as empresas podem ajudar",
          "Muito mais dispostos a comprar de marcas que estão praticando um papel mais ativo ",
          "Mais dispostos a comprar de marcas que estão praticando um papel mais ativo ",
          "Indiferentes a comprar de marcas que estão praticando um papel mais ativo ",
          "Menos dispostos a comprar de marcas que estão praticando um papel mais ativo ",
          " Muito menos dispostos a comprar de marcas que estão praticando um papel mais ativo "
        ]
      },
      {
        "id": 26,
        "tema": "PAPEL_DAS_MARCAS",
        "info": "Novas ações que engajam brasileiros. Entre os entrevistados, 41% se lembra de marcas que promovem ações sobre o novo momento. As marcas mais lembradas durante os três meses da quarentena tiveram pouca variação, com destaque para Itaú e Ambev. ",
        "indicadores": [
          "Lembram de alguma marca ter realizado algum tipo de ação",
          "Não lembram de alguma marca ter realizado algum tipo de ação"
        ]
      },
      {
        "id": 27,
        "tema": "HÁBITOS_DE_CONSUMO",
        "info": "Novos posicionamentos, novos clientes. O posicionamento das marcas em relação à pandemia gera um interesse maior na compra de produtos e serviços. As mulheres valorizam mais esse comportamento em comparação aos homens (41,97% vs. 32,22%) e querem comprar dessas marcas. Um fator importante em um cenário onde metade dos entrevistados topa, inclusive, trocar de marca na indisponibilidade de suas marcas preferidas.",
        "indicadores": [
          "Sim, estou muito disposto a trocar de marca",
          "Estão dispostos a trocar de marca caso o item desejado esteja indisponível e/ou acima do preço habitual",
          "Não, não estão nada disposto a trocar de marca caso o item desejado esteja indisponível e/ou acima do preço habitual??Muito mais dispostos a comprar de marcas que estão praticando um papel mais ativo ",
          "Mais dispostos a comprar de marcas que estão praticando um papel mais ativo ",
          "Indiferentes a comprar de marcas que estão praticando um papel mais ativo ",
          "Menos dispostos a comprar de marcas que estão praticando um papel mais ativo ",
          " Muito menos dispostos a comprar de marcas que estão praticando um papel mais ativo "
        ]
      },
      {
        "id": 28,
        "tema": "EMPREGO_E_RENDA",
        "info": "Novos impactos econômicos. A maior preocupação na opinião dos brasileiros continua sendo a economia. Na opinião dos entrevistados, os pequenos comerciantes (66%) e os profissionais autônomos (63%) serão os mais impactados pelos desdobramentos do cenário atual de combate à Covid-19. A partir do segundo mês do isolamento social, começa a diminuir a preocupação em relação às comunidades carentes, idosos e população em situação de rua. ",
        "indicadores": [
          "Idosos serão mais impactados pelos desdobramentos do cenário atual",
          "Crianças (Atrasos na Educação) serão mais impactadas pelos desdobramentos do cenário atual",
          "Profissionais autônomos/ pequenas e médias empresas serão mais impactados pelos desdobramentos do cenário atual",
          "Pequenos Comerciantes  serão mais impactados pelos desdobramentos do cenário atual",
          "Empresários serão mais impactados pelos desdobramentos do cenário atual",
          "População LGBTQA+ serão os mais impactados pelos desdobramentos do cenário atual",
          "População Carcerária serão os mais impactados pelos desdobramentos do cenário atual",
          "População em situação de rua serão os mais impactados pelos desdobramentos do cenário atual",
          "Comunidades carentes/favelas serão os mais impactados pelos desdobramentos do cenário atual",
          "Não sabem opinar a respeito de quem serão os mais impactados pelos desdobramentos do cenário atual"
        ]
      },
      {
        "id": 29,
        "tema": "",
        "info": "VIBES: EMPATIA FINANCEIRA Expectativa generalizada de resgate, paira no ar um desejo de solidariedade e flexibilização. Como o mercado pode ter uma postura mais empática com quem está em modo sobrevivência?",
        "indicadores": [
          "Têm buscado mais conteúdo de economia e negócios",
          "A mudança de rotina impactou de maneira financeira",
          "Rotina profissional foi alterada",
          "Estão trabalhando ",
          "Não estão trabalhando nem estudando",
          "Solidariedade de vizinhos e da sua comunidade foi sua principal \"descoberta\" nesse período",
          "Profissionais autônomos/ pequenas e médias empresas serão mais impactados pelos desdobramentos do cenário atual",
          "Pequenos Comerciantes  serão mais impactados pelos desdobramentos do cenário atual",
          "População em situação de rua serão os mais impactados pelos desdobramentos do cenário atual",
          "Comunidades carentes/favelas serão os mais impactados pelos desdobramentos do cenário atual",
          "Maior desemprego (falta de vagas) será uma realidade quando a quarentena acabar"
        ]
      },
      {
        "id": 30,
        "tema": "",
        "info": "VIBES: EGODEMIA Um efeito inesperado e terapêutico da vida em quarentena é a revolução do eu. As pessoas se tornam mais abertas a novos gostos, sabores e rituais. Se o brasileiro é naturalmente novidadeiro, essa pode ser a hora de experimentar.",
        "indicadores": [
          "Netflix é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Redes Sociais (Instagram, Facebook, Twitter, etc) são os aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Amazon Prime é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Globoplay é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "YouTube é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "WhatsApp é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Google é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Twitter é o aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Aplicativos de Relacionamento (Tinder,Grinder,Happn, etc) são os aplicativos/sites que tem utilizado com maior frequência nessa quarentena?",
          "Assistem Filmes/séries/Novelas/Documentários para lidar com a sua ansiedade e diminuir o stress ",
          "Assistidem vídeos no Youtube para lidar com a sua ansiedade e diminuir o stress ",
          "Utilizadam as redes sociais para lidar com a sua ansiedade e diminuir o stress ",
          "Leem (Livros, revistas, sites) para lidar com a sua ansiedade e diminuir o stress ",
          "Praticam jogos online para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com familiares e amigos online para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com as pessoas da minha casa para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com profissionais especializados online para lidar com a sua ansiedade e diminuir o stress ",
          "Realizam atividades físicas para lidar com a sua ansiedade e diminuir o stress ",
          "Meditam para lidar com a sua ansiedade e diminuir o stress ",
          "Práticam Yoga para lidar com a sua ansiedade e diminuir o stress ",
          "Realizam práticas religiosas (Orações) para lidar com a sua ansiedade e diminuir o stress ",
          "Realizam atividades manuais para lidar com a sua ansiedade e diminuir o stress ",
          "Fazem compras Online (Roupas, acessórios, eletrônicos, etc.) para lidar com a sua ansiedade e diminuir o stress ",
          "Conversam com familiares e amigos online para lidar com o tédio ",
          "Conversam com profissionais especializados online para lidar com o tédio ",
          "Conversam com as pessoas da minha casa para lidar com o tédio ",
          "Assistem vídeos no Youtube para lidar com o tédio ",
          "Realizam atividades físicas para lidar com o tédio ",
          "Realizam atividades manuais para lidar com o tédio ",
          "Assistem Filmes/séries/Novelas/Documentários para lidar com o tédio ",
          "Leem (Livros, revistas, sites) para lidar com o tédio ",
          "Utilizam as redes sociais para lidar com o tédio ",
          "Praticam jogos online para lidar com o tédio ",
          "Meditam para lidar com o tédio ",
          "Práticam Yoga para lidar com o tédio ",
          "Realizam práticas religiosas (Orações) para lidar com o tédio ",
          "Fazem compras Online (Roupas, acessórios, eletrônicos, etc.) para lidar com o tédio ",
          "Reinventar o convívio diário com a família foi sua principal \"descoberta\" nesse período",
          "Novas receitas foi sua principal \"descoberta\" nesse período",
          "Buscar formas de lidar com a ansiedade foi sua principal \"descoberta\" nesse período",
          "Funcionalidades da tecnologia (aprendeu a usar, ou passou usar melhor) foi sua principal \"descoberta\" nesse período",
          "Antigos \"hobbies\" foi sua principal \"descoberta\" nesse período",
          "Descobrir maneiras de se manter fisicamente ativo foi sua principal \"descoberta\" nesse período",
          "Solidariedade de vizinhos e da sua comunidade foi sua principal \"descoberta\" nesse período",
          "Têm buscado mais conteúdo de filmes",
          "Têm buscado mais conteúdo de séries",
          "Têm buscado mais conteúdo de humor (stand up, paródia, pegadinha, memes, zueira, etc..)",
          "Têm buscado mais conteúdo de novelas",
          "Têm buscado mais conteúdo de entrevistas",
          "Têm buscado mais conteúdo de Reality Shows",
          "Têm buscado mais conteúdo de ciências e tecnologia",
          "Têm buscado mais conteúdo de novidades e lançamentos de produtos",
          "Têm buscado mais conteúdo de ecologia, meio ambiente e consumo consciente",
          "Têm buscado mais conteúdo de Games",
          "Têm buscado mais conteúdo de Esportes",
          "Têm buscado mais conteúdo de Futebol (jogos, debate e resultados)",
          "Têm buscado mais conteúdo de Música",
          "Têm buscado mais conteúdo de Shows",
          "Têm buscado mais conteúdo de vídeos de como fazer/ aprender",
          "Têm buscado mais conteúdo de gastronomia, Culinária e receitas de cozinha",
          "Têm buscado mais conteúdo de educação/capacitação (Videoaulas)",
          "Têm buscado mais conteúdo de moda e beleza",
          "Têm buscado mais conteúdo infantil",
          "Têm buscado mais conteúdo de relacionamento",
          "Têm buscado mais conteúdo Adulto (XXX)",
          "Têm consumido mais produtos de higiene pessoal",
          "Passar mais tempo com a família pode passar a fazer parte da vida",
          "Falar mais com amigos/ família através de alguma ferramenta online pode passar a fazer parte da vida",
          "Ter um cuidado diferente com a higiene pode passar a fazer parte da vida",
          "Mudar meu meio de transporte/deslocamento pode passar a fazer parte da vida"
        ]
      },
      {
        "id": 31,
        "tema": "HÁBITOS_CONSUMO_ALIMENTAR",
        "info": "Novo momento, mais doces. O confinamento aumentou a vontade dos entrevistados por doces, especialmente entre as classes AB1. A busca por receitas de sobremesas aumentou 107% para pudim de leite condensado, 62% para bolo e 59% para brownie. Uma forma de compensar o isolamento.",
        "indicadores": [
          "Têm consumido mais balas, chocolates e doces em geral ",
          "Têm consumido mais salgadinhos, amendoin e outros snacks ",
          "Têm consumido mais bebidas alcoolicas ",
          "Têm consumido mais refeições do tipo Fast Food "
        ]
      },
      {
        "id": 32,
        "tema": "",
        "info": "VIBES: FUGA NOS PRAZERES Você não sabe o que é pior: ficar ansioso com a pandemia ou se jogar no que te dá prazer e se sentir culpado depois. Exagerar no prazer também pode ser uma forma de bem-estar. ",
        "indicadores": [
          "Se consideram muito ansiosos",
          "Se consideram muito ansiosos",
          "Nível de ansiedade aumentou",
          "Fazem compras Online (Roupas, acessórios, eletrônicos, etc.) para lidar com a sua ansiedade e diminuir o stress ",
          "Começou a ir ao shopping/compras durante a quarentena",
          "Fazer as refeições é a parte mais esperada do dia",
          "Fazem compras por Delivery",
          "Têm consumido mais bebidas alcoolicas ",
          "Têm consumido mais produtos de beleza",
          "Têm consumido mais balas, chocolates e doces em geral ",
          "Têm consumido mais salgadinhos, amendoin e outros snacks ",
          "Têm consumido mais refeições do tipo Fast Food "
        ]
      },
      {
        "id": 33,
        "tema": "DESLOCAMENTO",
        "info": "Novos deslocamentos. Há evidências do maior descolamento com a flexibilização do isolamento. Mais da metade das pessoas não usa o transporte público para evitar aglomerações. O carro passou a ser o principal de locomoção (seja o veículo próprio ou via aplicativos). Em comparação à primeira onda, há um crescimento no uso de aplicativos para os entrevistados, como Uber, 99, entre outros (9,3%). O número de pessoas que se locomovia a pé caiu durante os meses (27,6% na primeira semana vs. 16,6% na última semana, a onda 16). Isso demonstra o aumento das distâncias percorridas. As buscas por endereços de grande circulação no Brasil feitas no Google Maps não acontecem na mesma proporção que antes da pandemia, mas cresce a cada semana. ",
        "indicadores": [
          "Não têm utilizado transporte público",
          "Diminuiram o uso de transporte público",
          "Têm utilizado mais o carro",
          "Têm utilizado aplicativos de transporte (Ex: Uber, 99, Cabify)",
          "Não têm utilizado aplicativos de transporte",
          "Diminuiram o uso de aplicativos de transporte",
          "Têm andado somente a pé",
          "Têm utilizado bikes/patinetes"
        ]
      },
      {
        "id": 34,
        "tema": "QUARENTENA_TOTAL_PARCIAL",
        "info": "Nova flexibilização da quarentena. O número de pessoas que declaram alterações na rotina e nas atividades cotidianas por causa da pandemia tem diminuído a cada semana desde a flexibilização da quarentena. O número de pessoas em isolamento total cai, enquanto o de entrevistados em isolamento parcial cresce. Segue essa lógica o número de brasileiros que não saem do ambiente doméstico e aqueles que têm a intenção de ficar em quarentena ou deixar de circular, exceto em casos de emergência. ",
        "indicadores": [
          "Nada foi alterado na rotina com a chegada do vírus Corona (COVID-19)",
          "Quase nada foi alterado na rotina com a chegada do vírus Corona (COVID-19) ",
          "Pouco foi alterado na rotina com a chegada do vírus Corona (COVID-19)",
          "Rotina foi alterada com a chegada do vírus Corona (COVID-19)",
          "Rotina foi totalmente alterada com a chegada do vírus Corona (COVID-19)??Estão em quarentena sem sair de casa",
          "Estão saindo para questões essenciais ",
          "Alteraram minha rotina mas ainda saio de casa",
          "Evitam sair de casa, sai em algumas poucas ocasiões",
          "Minha rotina não foi alterada",
          "Estão isolados pois acreditam ter responsabilidade sobre a disseminação da doença",
          "Estão isolados para proteger seus entes queridos",
          "Estão isolados por determinação das Autoridades/Governo",
          "Evitam sair de casa, mas não estão isolado(a) por motivos econômicos/financeiros ",
          "Evitam sair de casa, mas acreditam que o cenário não é tão grave quanto se noticia",
          "Mantem convívio social normalmente por opção ",
          "Pretendem deixar de circular nas ruas, menos em casos de emergência, na próxima semana",
          "Não pretendem deixar de circular nas ruas, menos em casos de emergência, na próxima semana",
          "Têm intenção de ficar em quarentena",
          "Não tem intenção de ficar em quarentena"
        ]
      },
      {
        "id": 35,
        "tema": "",
        "info": "VIBES: QUARENTENA RELATIVA O distanciamento social torna-se um conceito relativo e aberto a interpretações. Tudo depende das condições, limitações e desejos (!) de cada um.",
        "indicadores": [
          "Estão saindo para questões essenciais ",
          "Alteraram minha rotina mas ainda saio de casa",
          "Evitam sair de casa, sai em algumas poucas ocasiões",
          "Minha rotina não foi alterada",
          "Estão isolados pois acreditam ter responsabilidade sobre a disseminação da doença",
          "Estão isolados para proteger seus entes queridos",
          "Estão isolados por determinação das Autoridades/Governo",
          "Evitam sair de casa, mas não estão isolado(a) por motivos econômicos/financeiros ",
          "Evitam sair de casa, mas acreditam que o cenário não é tão grave quanto se noticia",
          "Mantem convívio social normalmente por opção ",
          "Não pretendem deixar de circular nas ruas, menos em casos de emergência, na próxima semana",
          "Não tem intenção de ficar em quarentena",
          "Estão indo para o trabalho normalmente",
          "Estão indo para o trabalho, mas a empresa vai liberar para trabalhar em casa",
          "Não têm utilizado transporte público",
          "Diminuiram o uso de transporte público",
          "Têm utilizado mais o carro",
          "Têm utilizado aplicativos de transporte (Ex: Uber, 99, Cabify)",
          "Não têm utilizado aplicativos de transporte",
          "Diminuiram o uso de aplicativos de transporte",
          "Têm andado somente a pé",
          "Têm utilizado bikes/patinetes",
          "Estão indiferentes ao isolamento",
          "Não gostão do isolamento",
          "Começou a ir a bares e restaurantes durante a quarentena",
          "Começou a trabalhar no escritório/local de trabalho durante a quarentena",
          "Começou a praticar exercícios ao ar livre/academia durante a quarentena",
          "Começou a ir ao salão de beleza durante a quarentena",
          "Começou a ir ao shopping/compras durante a quarentena",
          "Começou a ir a shows/cinema/teatro durante a quarentena",
          "Começou a ir ao estádio de futebol/assistir outros esportes durante a quarentena",
          "Começou a ir à faculdade/cursos durante a quarentena",
          "Menor trânsito nas ruas foi o principal efeito positivo dessa quarentena ",
          "Vão MAIS vezes ao supermercado por DIA ",
          "Vão MAIS vezes ao supermercado por SEMANA ",
          "Fizeram compras em Lojas e mercadinhos de rua/Mercearias ",
          "Fizeram compras em Feiras e sacolões de bairro",
          "Fizeram compras em Super e hipermercados",
          "Estamos prontos para voltar à vida normal",
          "O pior já passou, a tendência é melhorar",
          "Não sabem avaliar, sinto que tudo é ainda muito incerto",
          "Não têm condições de fazer quarentena, precisam trabalhar para garantir a renda ",
          "Não estou fazendo e não pretendo fazer a quarentena independente de ter ou não condições para isso"
        ]
      },
      {
        "id": 36,
        "tema": "SENTIMENTOS_E_EMOÇÕES",
        "info": "Isolamento: novo aborrecimento? O descontentamento em relação ao isolamento não muda com o tempo. Dos entrevistados, 19% não gosta de estar isolado, um dado que se mantém estável desde o mês 1 (17%). As mulheres são as que menos gostam de ficar isoladas.",
        "indicadores": [
          "Gostam de se isolar/ficar isolado",
          "Não gostam, mas não veem problemas em ficar isolado",
          "Estão indiferentes ao isolamento",
          "Não gostão do isolamento",
          "Ainda não sabem dizer sobre o isolamento"
        ]
      },
      {
        "id": 37,
        "tema": "",
        "info": "VIBES: DESEJO DE IMUNIDADE Falta perspectiva para o fim da pandemia, enquanto cresce o desejo de voltar a ter liberdade. Assim, cada um faz seu cálculo do risco-benefício de se expor ou mesmo de contrair o novo Coronavírus.",
        "indicadores": [
          "Estão infectados pelo Coronavírus e já receberam confirmação do diagnóstico",
          "Podem estar infectados pelo Coronavírus, mas ainda não receberam confirmação do diagnóstico",
          "Estão em quarentena sem sair de casa",
          "Estão saindo para questões essenciais ",
          "Alteraram minha rotina mas ainda saio de casa",
          "Evitam sair de casa, sai em algumas poucas ocasiões",
          "Minha rotina não foi alterada",
          "Evitam sair de casa, mas não estão isolado(a) por motivos econômicos/financeiros ",
          "Conseguiram manter o deslocamento (mobilidade), mesmo durante a quarentena",
          "Estão indiferentes ao isolamento",
          "Não gostam do isolamento",
          "Começou a ir a bares e restaurantes durante a quarentena",
          "Começou a trabalhar no escritório/local de trabalho durante a quarentena",
          "Começou a ir ao salão de beleza durante a quarentena",
          "Todos os momento do dia são difíceis no isolamento",
          "A possibilidade de ser uma situação permanente é o que mais incomoda em relação ao período de isolamento",
          "Não ter clareza a respeito da duração dessa situação é o que mais incomoda em relação ao período de isolamento",
          "Estamos prontos para voltar à vida normal",
          "O pior já passou, a tendência é melhorar",
          "Não sabem avaliar, sinto que tudo é ainda muito incerto",
          "Não estou fazendo e não pretendo fazer a quarentena independente de ter ou não condições para isso"
        ]
      },
      {
        "id": 38,
        "tema": "DURAÇÃO_DA_CRISE",
        "info": "Novas dúvidas. A incerteza em relação ao tempo de duração da crise gera incômodo para mais de 60% dos entrevistados que ainda não têm clareza sobre a duração da pandemia. Dos brasileiros entrevistados, 32% acredita que ainda é preciso esperar mais para voltar ao “normal”.",
        "indicadores": [
          "Que seja uma situação provisória é o que mais incomoda em relação ao período de isolamento",
          "A possibilidade de ser uma situação permanente é o que mais incomoda em relação ao período de isolamento",
          "Não ter clareza a respeito da duração dessa situação é o que mais incomoda em relação ao período de isolamento",
          "Não sabem o que mais incomoda em relação ao período de isolamento??Estamos prontos para voltar à vida normal",
          "O pior já passou, a tendência é melhorar",
          "Não sabem avaliar, sinto que tudo é ainda muito incerto",
          "Ainda temos que esperar mais para voltar ao normal",
          "As coisas tendem a piorar ainda mais",
          "Não sabem opinar em relação à evolução dos casos de Coronavírus",
          "Acreditam que a situação irá melhorar em uma semana",
          "Acreditam que a situação irá melhorar em duas semanas ",
          "Acreditam que a situação irá melhorar em um mês ",
          "Acreditam que a situação irá melhorar em dois a três meses",
          "Acreditam que a situação irá melhorar em três a seis meses",
          "Acreditam que a situação irá melhorar em 6 meses a um ano",
          "Acreditam que a situação irá melhorar em mais de um ano"
        ]
      }
    ]
  }
};
