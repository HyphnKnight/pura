import { tag } from '../dist/framework/html.js';
import { renderToBody } from '../dist/framework/render.js';
import {
  createTextInput,
  createPasswordInput,
  createSearchInput,
  createCheckbox,
  createRadioInput,
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
  </body>
`));

state.value = 'something';
