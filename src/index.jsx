import ForgeUI, { render, Fragment, Text, Button, ButtonSet, useState, useProductContext } from "@forge/ui";
import api from "@forge/api";

const CLASSIFICATION_API = 'https://api.meaningcloud.com/class-2.0';

const { CLASSIFICATION_API_KEY, DEBUG_LOGGING } = process.env;

const OPTIONS = [
  ['Text Classification', 'en'],
];

var category = '';

const Panel = () => {
  const { platformContext: { issueKey } } = useProductContext();
  const [classification, setClassification] = useState(null);

  async function setLanguage(countryCode) {
    const issueResponse = await api.asApp().requestJira(`/rest/api/2/issue/${issueKey}?fields=summary,description`);
    await checkResponse('Jira API', issueResponse);
    const { summary, description } = (await issueResponse.json()).fields;
    const response = await api.fetch(`https://api.meaningcloud.com/class-2.0?key=57ca592c1af82ad89eed40c8aa5eec4f&of=json&model=IPTC_en&txt=${description}`);
    const categories = (await response.json()).category_list;
    console.log(categories)
    
    for (var key in categories) {
      if (categories.hasOwnProperty(key)) {
        if (key!=0){
          category = category + ' , '
        }
        category = category + categories[key]['label'] + " : " + categories[key]['code'] ;
      }
    }
    console.log(typeof(category));

    setClassification({
      classification: category
    });
  }
  
  // Render the UI
  return (
    <Fragment>
      <ButtonSet>
        {OPTIONS.map(([label, code]) =>
          <Button
            text={label}
            onClick={async () => { await setLanguage(code); }}
          />
        )}
      </ButtonSet>
      {classification && (
        <Fragment>
          <Text content={`**SUMMARY**`} />
          <Text content={classification.classification} />
        </Fragment>
      )}
    </Fragment>
  );
};

async function checkResponse(apiName, response) {
  if (!response.ok) {
    const message = `Error from ${apiName}: ${response.status} ${await response.text()}`;
    console.error(message);
    throw new Error(message);
  } else if (DEBUG_LOGGING) {
    console.debug(`Response from ${apiName}: ${await response.text()}`);
  }
}

export const run = render(<Panel />);
