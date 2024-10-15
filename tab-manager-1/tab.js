const save = document.getElementsByTagName("button");
const error = document.querySelector(".error")
const tabsAllowed = document.getElementsByTagName('span');
const noOfTabs = await chrome.storage.sync.get('noOfTabs');

if (noOfTabs.noOfTabs) 
{
  tabsAllowed[0].innerHTML = noOfTabs.noOfTabs;
}
else
{
  chrome.storage.sync.set({noOfTabs: 5});
  tabsAllowed[0].innerHTML = 5;
}

save[0].addEventListener("click", () => {
  const numberOfTabs = document.getElementsByTagName('input');
  if (numberOfTabs[0].value < 5) {
    error.innerHTML = "Please enter a number greater than 5";
  }
  else{
    error.innerHTML = "";
    chrome.storage.sync.set({noOfTabs: numberOfTabs[0].value})
    tabsAllowed[0].innerHTML = numberOfTabs[0].value;
  }
});
