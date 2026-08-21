const demoFlowSteps = [
  {
    botKey: 'intro.bot',
    quickBtnKeys: ['intro.actions.availability', 'intro.actions.hours', 'intro.actions.menu'],
    step: 0
  },
  {
    userKey: 'intro.actions.availability',
    botKey: 'availability.bot',
    quickBtnKeys: ['availability.actions.order', 'availability.actions.quantity', 'availability.actions.discounts'],
    step: 1
  },
  {
    userKey: 'availability.actions.order',
    botKey: 'order.bot',
    quickBtnKeys: ['order.actions.one', 'order.actions.two', 'order.actions.three'],
    step: 2
  },
  {
    userKey: 'order.actions.two',
    botKey: 'quantity.bot',
    quickBtnKeys: ['quantity.actions.delivery', 'quantity.actions.pickup'],
    step: 2
  },
  {
    userKey: 'quantity.actions.delivery',
    botKey: 'delivery.bot',
    quickBtnKeys: ['delivery.actions.slotOne', 'delivery.actions.slotTwo'],
    step: 3
  },
  {
    userKey: 'delivery.actions.slotTwo',
    botKey: 'summary.bot',
    quickBtnKeys: ['summary.actions.confirm', 'summary.actions.edit'],
    step: 3
  },
  {
    userKey: 'summary.actions.confirm',
    botKey: 'confirmed.bot',
    systemKey: 'confirmed.system',
    quickBtnKeys: [],
    step: 4
  }
];

const heroResponseKeys = {
  'See menu': 'menu',
  'Order food': 'order',
  'Delivery info': 'delivery'
};

const heroQuickActionKeys = ['menu', 'order', 'delivery'];

const escrowStepKeys = ['placed', 'payment', 'held', 'preparation', 'delivery', 'pin', 'released'];

export const getDemoFlow = (t: any) =>
  demoFlowSteps.map((step) => ({
    bot: t(`chatDemo.flow.${step.botKey}`),
    quickBtns: step.quickBtnKeys.map((key) => t(`chatDemo.flow.${key}`)),
    step: step.step,
    ...(step.userKey ? { user: t(`chatDemo.flow.${step.userKey}`) } : {}),
    ...(step.systemKey ? { systemMsg: t(`chatDemo.flow.${step.systemKey}`) } : {})
  }));

export const getHeroResponses = (t: any) => ({
  [t('heroChat.actions.menu')]: [t('heroChat.responses.menu')],
  [t('heroChat.actions.order')]: [t('heroChat.responses.order')],
  [t('heroChat.actions.delivery')]: [t('heroChat.responses.delivery')]
});

export const getHeroQuickActions = (t: any) =>
  heroQuickActionKeys.map((key) => ({
    label: t(`heroChat.actions.${key}`),
    response: t(`heroChat.responses.${(heroResponseKeys as any)[t(`heroChat.actions.${key}`)] || key}`)
  }));

export const getEscrowData = (t: any) =>
  escrowStepKeys.map((key) => ({
    title: t(`escrowFlow.steps.${key}.title`),
    desc: t(`escrowFlow.steps.${key}.description`)
  }));

export const getEscrowLabels = (t: any) => escrowStepKeys.map((key) => t(`escrowFlow.labels.${key}`));
