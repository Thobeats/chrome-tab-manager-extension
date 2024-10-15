chrome.tabs.onCreated.addListener(async (tab) => {
    const tabs =  await chrome.tabs.query({active: false});
    const numberOfTabs = await chrome.storage.sync.get('noOfTabs');

    if (numberOfTabs.noOfTabs == tabs.length)
    {
        console.log("You have exceeded the allowable amount of tabs");
        chrome.tabs.remove(tab.id);
    }
});