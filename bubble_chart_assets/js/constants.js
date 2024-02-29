const CONST = {
  width: 540,
  height: 540,
  forceStrength: 0.08,
  get center() {
    const x = this.width / 2;
    const y = this.height / 2;
    return { x, y };
  },
  months: [
    {
      name: 'M1',
      label: 'Março/Abril',
      startDate: '21/3',
      endDate: '12/4'
    },
    { 
      name: 'M2',
      label: 'Abril/Maio',
      startDate: '17/4',
      endDate: '11/5'
    },
    {
      name: 'M3',
      label: 'Maio/Junho',
      startDate: '15/5',
      endDate: '8/6'
    },
    { 
      name: 'M4',
      label: 'Junho/Julho',
      startDate: '12/6',
      endDate: '6/7'
    }
  ],
  themes: [
    { name: "T1", label: "1 - Informações sobre o Coronavírus" },
    { name: "T2", label: "2 - Impacto do Corona na rotina" },
    { name: "T3", label: "3 - A Vida em quarentena" },
    { name: "T4", label: "4 - A relação com Marcas" }
  ]
}