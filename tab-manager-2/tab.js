
const groupButton = document.querySelector('#group');
const removeButton = document.querySelector('#remove');
const ungroupButton = document.querySelector('#ungroup');
const removeGroupButton = document.querySelector('#delete-group');
const list = document.getElementById('grouped-tab-list');


addTabsToList();
allGroupedTabs();
groupButton.addEventListener('click', addTabsToGroup);
removeButton.addEventListener('click', removeTabsFromGroup);
ungroupButton.addEventListener('click', ungroupTabs);
removeGroupButton.addEventListener('click', deleteGroupTabs);



async function allGroupedTabs()
{
  const grouped = await chrome.tabs.query({});
  const tabs = Object.entries(grouped);
  const groupedTabs = tabs.filter(tab => tab[1].groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE);

  let groupIds = groupedTabs.reduce((acc, tab) => {
    const groupId = tab[1].groupId;
    if (!acc[groupId])
    {
      acc[groupId] = [];
    }
    acc[groupId].push(tab[1]);
    return acc;
  }, {});

  for (const groupId in groupIds)
  {
    addGroupedTabsToList(groupId, groupIds[groupId]);
  }

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

async function addGroupedTabsToList(groupId, groupTabs=null)
{
  let group = await chrome.tabGroups.update(parseInt(groupId), {
    collapsed: true,
    title: "Grouped Tabs"
  });

  if (!groupTabs)
  {
    groupTabs = await chrome.tabs.query({groupId: parseInt(groupId)});
  }
  let groupTemplate = `
    <li>
      <input class='grouped-check-list' type='checkbox' value='${groupId}'> <span>${group.title}</span>
      <ul class='grouped-list'>
    `;

  for (const tab of groupTabs)
  {
    let template = `
      <li>
        <span>${tab.title}</span>
      </li>
    `;

    groupTemplate += template;
  }

  groupTemplate += '</ul></li>';

  list.innerHTML += groupTemplate;
}


async function ungroupTabs()
{
  const checkboxes = list.querySelectorAll('.grouped-check-list:checked');
  const groupIds = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));

  for (const groupId of groupIds)
  {
    const groupTabs = await chrome.tabs.query({groupId: groupId});
    chrome.tabs.ungroup(groupTabs.map(tab => tab.id))
    .then(() => addTabsToList())
    .then(() => {  
      list.innerHTML = "";
      allGroupedTabs()
    });
  }
}

async function deleteGroupTabs()
{
  const checkboxes = list.querySelectorAll('.grouped-check-list:checked');
  const groupIds = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));

  for (const groupId of groupIds)
  {
    const groupTabs = await chrome.tabs.query({groupId: groupId});
    chrome.tabs.remove(groupTabs.map(tab => tab.id))
    .then(() => {  
      list.innerHTML = "";
      allGroupedTabs()
    });
  }
}


