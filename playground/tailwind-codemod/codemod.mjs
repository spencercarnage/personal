import classLookUp from './tw-classes-map.json';

const classNamesRE = new RegExp(
  `\\b(?:${Object.keys(classLookUp).join('|')})\\b`,
  'g',
);

function matchClassName(value) {
  if (!value) {
    return value;
  }

  try {
    const matches = [];
    let newValue = value;

    // Use the regular expression to find matches
    let match;

    // biome-ignore lint/suspicious/noAssignInExpressions: ignore ast.forEach
    while ((match = classNamesRE.exec(value)) !== null) {
      matches.push(match[0]);
    }

    if (matches.length) {
      for (const match of matches) {
        newValue = value.replace(match, classLookUp[match]);
      }

      return newValue;
    }
  } catch (e) {
    console.log('err', e);
  }
}

export const parser = 'tsx';

export default (file, api) => {
  /**
   * Alias the JSCodeShift API
   */
  const j = api.jscodeshift;

  /**
   * Parse the code into an AST
   */
  const root = j(file.source);

  /* className="foo bar baz" and className={classnames('foo', { bar: 'baz' })} */
  // biome-ignore lint/complexity/noForEach: ignore ast.forEach
  root
    .find(j.JSXAttribute, {
      name: {
        name: 'className',
      },
    })
    .forEach((path) => {
      const { value } = path.value;

      if (value.type === 'StringLiteral') {
        const newValue = matchClassName(value.value);

        if (newValue) {
          value.value = newValue;
        }
      }

      if (value.type === 'JSXExpressionContainer') {
console.log(value.expression.type);
        switch(value.expression.type) {
          case 'CallExpression':
            for (const arg of value.expression.arguments) {
              // console.log('b', arg);
              if (arg.type === 'StringLiteral') {
                // console.log('b', filePath, arg.value);
                const newValue = matchClassName(arg.value);

                if (newValue) {
                  arg.value = newValue;
                }
                //console.log(arg.value);
              }

              if (arg.type === 'ObjectExpression') {
                for (const property of arg.properties) {
                  const newValue = matchClassName(property?.key?.value);

                  if (newValue) {
                    property.key.value = newValue;
                  }
                }
              }
            }
            break;

          case 'LogicalExpression':
            break;

          case 'ConditionalExpression':
            break;

          case 'TemplateLiteral':
            break;
        }
      }
    });

  return root.toSource();
}
