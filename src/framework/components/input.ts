import { map } from '../../array';
import { tag } from '../html';
import { Tag } from '../types';
import { render } from '../render';
import { uniqueId } from '../../string';
import { isString } from '../../is/type';

export type CreateModule<Config> =
  (initConfig:Config) =>
    (props:Partial<Config>) =>
      HTMLElement;


/* Text Input */
export interface TextConfig {
  label: string;
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
  autocomplete?: string;
  inputmode?: string;
  disabled?: boolean;
}

export const createTextInput: CreateModule<TextConfig> =
  (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config: TextConfig = Object.assign({}, initConfig);
    return (props) => {
      Object.assign(config, initConfig, props);
      return render(tag`
        <field-set class="--text">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            type="text"
            disabled="${config.disabled || false}"
            placeholder="${config.placeholder || ''}"
            autocomplete="${config.autocomplete || 'none'}"
            value="${config.value}"
            oninput="${event => config.onInput((event.target as HTMLInputElement).value)}"
          />
        </field-set>
      `, element);
    };
  };


/* Number Input */
export interface NumberConfig {
  label: string;
  value: number;
  onInput: (value: number) => void;
  type?: 'number' | 'range';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const createNumberInput: CreateModule<NumberConfig>=
  (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config: NumberConfig = Object.assign({type:'number'}, initConfig);
    return (props) => {
      Object.assign(config, initConfig, props);
      return render(tag`
        <field-set class="--${config.type}">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            type="${config.type}"
            disabled="${config.disabled || false}"
            placeholder="${config.placeholder || ''}"
            min="${config.min || 0}"
            max="${config.max || 100}"
            step="${config.step || 1}"
            value="${config.value}"
            oninput="${event => config.onInput(Number((event.target as HTMLInputElement).value))}"
          />
        </field-set>
      `, element);
    };
  };


/* Password Input */
export interface PasswordConfig {
  label: string;
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
  autocomplete?: 'new-password' | 'current-password';
  disabled?: boolean;
}

export const createPasswordInput: CreateModule<PasswordConfig>=
  (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config: PasswordConfig = Object.assign({}, initConfig);
    return (props) => {
      Object.assign(config, initConfig, props);
      return render(tag`
        <field-set class="--password">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            type="password"
            disabled="${config.disabled || false}"
            autocomplete="${config.autocomplete || 'none'}"
            placeholder="${config.placeholder || ''}"
            value="${config.value}"
            oninput="${event => config.onInput((event.target as HTMLInputElement).value)}"
          />
        </field-set>
      `, element);
    };
  };


/* Search Input */
export interface SearchConfig {
  label: string;
  value: string;
  onInput: (value: string) => void;
  options?: string[];
  placeholder?: string;
  autocomplete?: string;
  inputmode?: string;
  disabled?: boolean;
}

export const createSearchInput:CreateModule<SearchConfig> =
  (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config: SearchConfig = Object.assign({}, initConfig);
    return (props) => {
      Object.assign(config, initConfig, props);
      return render(tag`
        <field-set class="--search">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            list="${`list_${id}`}"
            type="search"
            disabled="${config.disabled || false}"
            placeholder="${config.placeholder || ''}"
            autocomplete="${config.autocomplete || 'none'}"
            value="${config.value}"
            oninput="${event => config.onInput((event.target as HTMLInputElement).value)}"
          />
          ${!!config.options ? tag`<datalist id="${`list_${id}`}">
            ${map(config.options || [], (option: string) => tag`<option value="${option}" />`)}
          </datalist>` : null}
        </field-set>
      `, element);
    };
  };


/* Checkbox Input */
export interface CheckboxConfig {
  label: string;
  value: boolean;
  onInput: (value: boolean) => void;
  disabled?: boolean;
}

export const createCheckbox: CreateModule<CheckboxConfig> =
  (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config: CheckboxConfig = Object.assign({}, initConfig);
    return (props) => {
      Object.assign(config, initConfig, props);
      return render(tag`
        <field-set class="--checkbox">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            type="checkbox"
            disabled="${config.disabled || false}"
            checked="${config.value}"
            onchange="${() => config.onInput(!config.value)}"
          />
        </field-set>
      `, element);
    };
  };

/* Radio Input */
export interface RadioConfig {
  value: string;
  options: string[];
  onInput: (value:string)=>void;
  disabled?: boolean;
}
const createRadioButton =
  (label: string, name: string) => {
    const element = document.createElement('li');
    const id = uniqueId();
    return (config:RadioConfig):HTMLElement =>
      render(tag`
        <li>
          <label for="${id}" >${label}</label>
          <input
            id="${id}"
            type="radio"
            name="${name}"
            disabled="${config.disabled || false}"
            checked="${config.value === label}"
            onchange="${() => config.onInput(label)}"
          />
        </li>
      `, element);
  };

export const createRadioInput: CreateModule<RadioConfig> =
  (initConfig) => {
    const element = document.createElement('field-set');
    const config: RadioConfig = Object.assign({}, initConfig);
    const name = `name_${uniqueId}`;
    const options: ((config:RadioConfig) => HTMLElement)[] = map(
      config.options,
      (option) => createRadioButton(
        option,
        name,
      ),
    );
    return (props) => {
      Object.assign(config, initConfig, props);
      return render(tag`
        <field-set class="--radio">
          <ul>
            ${map(options, (create) => create(config))}
          </ul>
        </field-set>
      `, element);
    };
  };


/* Select Input */
export interface SelectOptionGroup {
  label: string;
  options: string[];
  disabled?:boolean;
}

export interface SelectConfig {
  label: string;
  onInput: (value: string) => void;
  value: string | false;
  options: (string | SelectOptionGroup)[];
  disabled?: boolean;
}

const createSelectItem =
  (value:string| false) =>
    (option: string | SelectOptionGroup): Tag => {
      if (isString(option)) {
        return tag`
          <option
            value="${option}"
            selected="${value ? value === option : false}"
          >${option}</option>`;
      } else {
        return tag`
          <optgroup
            label="${option.label}"
            disabled="${option.disabled || false}">
            ${map(option.options,createSelectItem(value))}
          </optgroup>
        `;
      }
    };

export const createSelectInput: CreateModule<SelectConfig> =
  (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config: SelectConfig = Object.assign({}, initConfig);
    return (props) => {
      Object.assign(config, initConfig, props);
      return render(tag`
        <field-set class="--select">
          <label for="${id}">${config.label}</label>
          <select
            id="${id}"
            value="${config.value}"
            disabled="${config.disabled || false}"
            oninput="${event => config.onInput((event.target as HTMLInputElement).value)}"
            >
            ${map(config.options,createSelectItem(config.value))}
          </select>
        </field-set>
      `, element);
    };
  };

/* Button Input */
export interface ButtonConfig {
  label:string;
  onInput:()=>void;
  disabled?: boolean;
}

export const createButton: CreateModule<ButtonConfig> =
  (initConfig) => {
    const element = document.createElement('field-set');
    const config: ButtonConfig = Object.assign({}, initConfig);
    return (props) => {
      Object.assign(config, initConfig, props);
      return render(tag`
        <button
          disabled="${config.disabled}"
          onclick="${config.onInput}"
        >${config.label}</button>
      `, element);
    };
  };

