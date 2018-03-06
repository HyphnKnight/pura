import {tag} from '../dist/framework/html.js';
import {renderToBody} from '../dist/framework/render.js';

const testInsertedTag = tag`
<a href="/">this is a test</a>
`;

const testStringInsert = `\
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere quam \
scelerisque elit venenatis, vel feugiat augue commodo. Nam vel pulvinar sem. \
Pellentesque egestas augue non vestibulum fermentum. Mauris fermentum orci \
non ultricies vulputate. Nunc at ornare dui. Mauris eget elit non ipsum \
imperdiet porta. Aenean eget ultricies magna. Etiam a nisl nec urna imperdiet mattis. \
Maecenas tincidunt justo at purus suscipit commodo. Nam vitae velit lacinia, \
sodales est vitae, venenatis felis.\
`;

renderToBody(tag`
  <body>
    <h1>Test header</h1>
    <p>${testStringInsert}</p>
    ${testInsertedTag}
  </body>
`);
