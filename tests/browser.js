import { tag } from '../dist/framework/html.js';
import { renderToBody } from '../dist/framework/render.js';
import {
  createTextInput,
  createPasswordInput,
  createSearchInput,
  createCheckbox,
  createRadioInput,
  createSelectInput,
} from '../dist/framework/components/input';
import { createStore } from '../dist/store';

const testInsertedTag = tag`
<a href="/">this is a test</a>
`;

const state = createStore({
  value: 'test',
  password: '',
  search: '',
  checkbox: false,
  radio: false,
  select: '',
});

window.state = state;

const SampleInput = createTextInput({
  label:'username',
  onInput: (value) => state.value = value,
  value: '',
});
const passwordTest = /[A-z0-9]+/;
const SamplePassword = createPasswordInput({
  label:'password',
  onInput :(value) => {
    if (passwordTest.test(value)) {
      state.password = value.toLowerCase();
    }
  }
});
const SampleSearch = createSearchInput({
  label: 'search',
  onInput: (value) => {
    state.search = value;
  },
})
const SampleCheckbox = createCheckbox({
  label:'add email',
  onInput:(value) => state.checkbox = value,
});
const SampleRadio = createRadioInput({
  onInput: value => console.log(state.radio = value),
  options: [
    'option A',
    'option B',
    'option C',
  ]
});

const SampleSelect = createSelectInput({
  label: 'Select stuff',
  options: [
    'option A',
    'option B',
    'option C',
    {
      label:'Sub group',
      options: [
        'option D-A',
        'option D-B',
        'option D-C',
        'option D-D',
      ]
    }
  ],
  onInput: (value) => {
    state.select = value;
  },
});

state.subscribe((state) => renderToBody(tag`
  <body>
    <h1>${state.value}</h1>
    ${testInsertedTag}
    ${SampleInput({value:state.value})}
    <span>${state.password}</span>
    ${SamplePassword({value:state.password})}
    ${SampleSearch({value:state.search})}
    <span>${state.checkbox?'checked':'unchecked'}</span>
    ${SampleCheckbox({value:state.checkbox})}
    <span>${state.radio}</span>
    ${SampleRadio({value:state.radio})}
    <span>${state.select}</span>
    ${SampleSelect({value: state.select})}
  </body>
`));

state.value = 'something';
