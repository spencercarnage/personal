import fs from 'fs/promises';
import path from 'path';
import * as url from 'url';
import parser from '@babel/parser';
import j from 'jscodeshift';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const classLookUp = JSON.parse(
  await fs.readFile(path.join(__dirname, './tw-classes-map.json'), 'utf8'),
);
const classNamesRE = new RegExp(
  `\\b(?:${Object.keys(classLookUp).join('|')})\\b`,
  'g',
);

const args = process.argv.slice(2).reduce(
  (memo, arg) => {
    const split = arg.split('=');
    memo[split[0].replace('--', '')] = split[1];
    return memo;
  },
  {
    folder: '',
  },
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
    while ((match = classNamesRE.exec(value)) !== null) {
      matches.push(match[0]);
    }

    if (matches.length) {
      matches.forEach((match) => {
        newValue = value.replace(match, classLookUp[match]);
      });
      // console.log(
      //   `Found matches in className prop: ${matches.join(', ')} for value ${value}`,
      // );

      return newValue;
    }
  } catch (e) {
    console.log('err', e);
  }
}

const sourcePath = path.join(args.folder);

async function convertTWClasses(sourcePath) {
  try {
    const stats = await fs.stat(sourcePath);
    const isSourcePathDir = stats.isDirectory();
    const files = isSourcePathDir ? await fs.readdir(sourcePath) : [sourcePath];

    await Promise.all(
      files.map(async (fileName) => {
        const filePath = isSourcePathDir
          ? path.join(sourcePath, fileName)
          : fileName;
        const stats = await fs.stat(filePath);

        const isDir = stats.isDirectory();

        if (isDir) {
          convertTWClasses(filePath);
          return;
        }

        if (!fileName.match(/(jsx|tsx)$/)) {
          return;
        }

        const source = await fs.readFile(filePath, 'utf8');
        const root = j(source, {
          parser: {
            parse: (code, options) =>
              parser.parse(code, {
                ...options,
                tokens: true,
                plugins: ['jsx', 'typescript'],
              }),
          },
        });

        /* const CLASSES = { root: 'foo' } */
        root.find(j.ObjectExpression).forEach((path) => {
          if (filePath.match(/NavigationListItem\.jsx$/)) {
          }
          const { value } = path;
          value.properties.forEach((property) => {
            if (property.type === 'StringLiteral') {
              // console.log('c', filePath, property.value.value);
              const newValue = matchClassName(property.value.value);

              if (newValue) {
                property.value.value = newValue;
              }
            }
          });
        });

        // classes={{ foo: 'bar' }}
        root
          .find(j.JSXAttribute, {
            name: {
              name: 'classes',
            },
          })
          .forEach((path) => {
            const { value } = path.value;
            //console.log("classes", value);
            // classes={{ root: 'foo' }}
            if (value.expression.type === 'ObjectExpression') {
              value.expression.properties.forEach((property) => {
                // console.log('d', filePath, property?.value?.value);
                const newValue = matchClassName(property?.value?.value);

                if (newValue) {
                  property.value.value = newValue;
                }
              });
            }
          });

        /* className="foo bar baz" and className={classnames('foo', { bar: 'baz' })} */
        root
          .find(j.JSXAttribute, {
            name: {
              name: 'className',
            },
          })
          .forEach((path) => {
            const { value } = path.value;
            if (value.type === 'StringLiteral') {
              // console.log('a', filePath, value.value);
              const newValue = matchClassName(value.value);

              if (newValue) {
                value.value = newValue;
              }
            }
            if (value.type === 'JSXExpressionContainer') {
              value.expression?.arguments?.forEach((arg) => {
                // console.log('b', filePath, arg.value);
                if (arg.type === 'StringLiteral') {
                  // console.log('b', filePath, arg.value);
                  const newValue = matchClassName(arg.value);
                  if (newValue) {
                    arg.value = newValue;
                  }
                  //console.log(arg.value);
                }
                if (arg.type === 'ObjectExpression') {
                  arg.properties.forEach((property) => {
                    const newValue = matchClassName(property?.key?.value);

                    if (newValue) {
                      property.key.value = newValue;
                    }
                  });
                }
              });
            }
          });

        await fs.writeFile(filePath, root.toSource({ quote: 'single' }));
      }),
    );
  } catch (err) {
    console.log(err);
    process.exit(12);
  }
}

convertTWClasses(sourcePath);
