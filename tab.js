const groupButton = document.querySelector('#group');
const removeButton = document.querySelector('#remove');

addTabsToList();
allGroupedTabs();
groupButton.addEventListener('click', addTabsToGroup);
removeButton.addEventListener('click', removeTabsFromGroup);



async function allGroupedTabs()
{
  const grouped = await chrome.tabs.query({});
  const tabs = Object.entries(grouped);
  const groupedTabs = tabs.filter(tab => tab[1].groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE);
  console.log(Object.entries(groupedTabs));
}





async function addTabsToList()
{
  const tabs = await chrome.tabs.query({
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
  });
  
  const list = document.getElementById('ungrouped-tab-list');
  list.innerHTML = '';
  if (tabs.length === 0)
  {
    groupButton.style.display = 'none';
  }
  else{
    groupButton.style.display = 'block';
  }

  for (const tab of tabs)
  {
    let template = `
      <li>
        <input class='list-tab' type='checkbox' value='${tab.id}'> <span>${tab.title}</span>
      </li>
    `;

    list.innerHTML += template;
  }

}


function addTabsToGroup()
{
  const list = document.getElementById('ungrouped-tab-list');
  const checkboxes = list.querySelectorAll('.list-tab:checked');
  const tabIds = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));

  chrome.tabs.group({tabIds: tabIds}, (groupId) => addGroupedTabsToList(groupId));
  addTabsToList();
}

function removeTabsFromGroup()
{
  const list = document.getElementById('ungrouped-tab-list');
  const checkboxes = list.querySelectorAll('.list-tab:checked');
  const tabIds = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));

  chrome.tabs.remove(tabIds, () => addTabsToList());
}

async function addGroupedTabsToList(groupId)
{
  let groupTabs = await chrome.tabs.query({groupId});
  let group = await chrome.tabGroups.update(groupId, {
    collapsed: true,
    title: "Grouped Tabs"
  });

  let groupTemplate = `
    <li>
      <input class='grouped-check-list' type='checkbox' value='${groupId}'><span>${group.title}</span>
      <ul>
    `;

  for (const tab of groupTabs)
  {
    let template = `
      <li>
        <input class='grouped-tab-check-list' type='checkbox' value='${tab.id}'><span>${tab.title}</span>
      </li>
    `;

    groupTemplate += template;
  }

  groupTemplate += '</ul></li>';

  const list = document.getElementById('grouped-tab-list');
  list.innerHTML += groupTemplate;
}