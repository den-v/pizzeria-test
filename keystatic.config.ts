// The admin at /keystatic. It edits the files in src/content that the site is built from.
// Keep it in step with src/content.config.ts. Field options: https://keystatic.com/docs/fields
import { config, collection, singleton, fields } from '@keystatic/core';

const dayHours = (label: string) =>
  fields.object(
    {
      closed: fields.checkbox({ label: 'Closed all day', defaultValue: false }),
      open: fields.text({ label: 'Opens at', description: '24-hour time, e.g. 11:00' }),
      close: fields.text({
        label: 'Closes at',
        description: '24-hour time, e.g. 22:00. A time earlier than the opening time means after midnight.',
      }),
    },
    { label, layout: [4, 4, 4] },
  );

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Forno Rosso' },
    navigation: {
      Menu: ['pizzas', 'offers'],
      Guests: ['reviews'],
      Restaurant: ['info', 'history'],
    },
  },
  collections: {
    pizzas: collection({
      label: 'Pizzas',
      slugField: 'name',
      path: 'src/content/pizzas/*',
      format: { data: 'yaml' },
      columns: ['category', 'price30', 'price40', 'available'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Classic', value: 'classic' },
            { label: 'Signature', value: 'signature' },
            { label: 'White pizza', value: 'white' },
          ],
          defaultValue: 'classic',
        }),
        order: fields.integer({ label: 'Position in its category', description: 'Lower numbers come first.', defaultValue: 0 }),
        description: fields.text({ label: 'Short description', multiline: true, validation: { length: { min: 1 } } }),
        price30: fields.integer({ label: 'Price 30 cm (₴)', validation: { isRequired: true, min: 0 } }),
        price40: fields.integer({ label: 'Price 40 cm (₴)', validation: { isRequired: true, min: 0 } }),
        ingredients: fields.array(fields.text({ label: 'Ingredient' }), {
          label: 'Ingredients',
          itemLabel: (props) => props.value,
        }),
        photo: fields.image({
          label: 'Photo',
          directory: 'src/assets/pizzas',
          publicPath: '../../assets/pizzas/',
          validation: { isRequired: true },
        }),
        photoAlt: fields.text({ label: 'Photo description (for screen readers)' }),
        labels: fields.multiselect({
          label: 'Labels',
          options: [
            { label: 'Spicy', value: 'spicy' },
            { label: 'Vegetarian', value: 'vegetarian' },
            { label: 'New', value: 'new' },
          ],
        }),
        available: fields.checkbox({
          label: 'Available',
          description: 'Untick when sold out. The pizza stays on the menu, marked as unavailable.',
          defaultValue: true,
        }),
      },
    }),
    offers: collection({
      label: 'Special offers',
      slugField: 'title',
      path: 'src/content/offers/*',
      format: { data: 'yaml' },
      columns: ['startDate', 'endDate'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        badge: fields.text({ label: 'Badge', description: 'Short highlight, e.g. "−20%" or "Free"' }),
        description: fields.text({ label: 'Description', multiline: true, validation: { length: { min: 1 } } }),
        startDate: fields.date({ label: 'First day', validation: { isRequired: true } }),
        endDate: fields.date({ label: 'Last day', validation: { isRequired: true } }),
        pizza: fields.relationship({ label: 'Featured pizza (optional)', collection: 'pizzas' }),
      },
    }),
    reviews: collection({
      label: 'Reviews',
      slugField: 'author',
      path: 'src/content/reviews/*',
      format: { data: 'yaml' },
      columns: ['rating', 'date', 'approved'],
      schema: {
        author: fields.slug({ name: { label: 'Guest name' } }),
        rating: fields.integer({ label: 'Rating (1–5)', defaultValue: 5, validation: { min: 1, max: 5, isRequired: true } }),
        text: fields.text({ label: 'Review', multiline: true, validation: { length: { min: 1 } } }),
        date: fields.date({ label: 'Date', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        approved: fields.checkbox({
          label: 'Approved',
          description: 'Only approved reviews are shown on the site.',
          defaultValue: false,
        }),
      },
    }),
  },
  singletons: {
    info: singleton({
      label: 'Contact, hours & pizza of the week',
      path: 'src/content/site/info',
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Pizzeria name' }),
        tagline: fields.text({ label: 'Tagline' }),
        address: fields.text({ label: 'Street address' }),
        city: fields.text({ label: 'City & postcode' }),
        phone: fields.text({ label: 'Phone' }),
        email: fields.text({ label: 'Email' }),
        mapUrl: fields.url({ label: 'Map link', validation: { isRequired: true } }),
        instagram: fields.text({ label: 'Instagram handle', description: 'Without the @' }),
        pizzaOfTheWeek: fields.relationship({ label: 'Pizza of the week', collection: 'pizzas' }),
        pizzaOfTheWeekNote: fields.text({ label: 'Why this pizza this week', multiline: true }),
        hours: fields.object(
          {
            monday: dayHours('Monday'),
            tuesday: dayHours('Tuesday'),
            wednesday: dayHours('Wednesday'),
            thursday: dayHours('Thursday'),
            friday: dayHours('Friday'),
            saturday: dayHours('Saturday'),
            sunday: dayHours('Sunday'),
          },
          { label: 'Opening hours' },
        ),
        holidays: fields.array(
          fields.object({
            date: fields.date({ label: 'Date', validation: { isRequired: true } }),
            label: fields.text({ label: 'Reason', description: 'e.g. Christmas' }),
          }),
          {
            label: 'Closed on these dates',
            itemLabel: (props) => `${props.fields.date.value ?? ''} ${props.fields.label.value}`.trim(),
          },
        ),
      },
    }),
    history: singleton({
      label: 'Our story',
      path: 'src/content/site/history',
      format: { data: 'yaml' },
      schema: {
        title: fields.text({ label: 'Page title' }),
        intro: fields.text({ label: 'Introduction', multiline: true }),
        milestones: fields.array(
          fields.object({
            year: fields.integer({ label: 'Year', validation: { isRequired: true } }),
            title: fields.text({ label: 'Title' }),
            text: fields.text({ label: 'Text', multiline: true }),
          }),
          { label: 'Milestones', itemLabel: (props) => `${props.fields.year.value ?? ''} — ${props.fields.title.value}` },
        ),
      },
    }),
  },
});
