const deleteAccount = async (e) => {
  e.preventDefault();
  const passwordVerify = document
    .querySelector("#password-confirm")
    .value.trim();
  const response = await fetch("/api/users/delete", {
    method: "DELETE",
    body: JSON.stringify({ passwordVerify }),
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    console.log("Account deleted!");

    document.location.replace("/");
  } else {
    await Toast.fire("Failed to delete account!");
  }
};

const deleteCollection = async (e) => {
  e.preventDefault();

  const response = await fetch("/api/collection/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if(response.ok) {
    await Toast.fire({
      icon: "success",
      title: "Collection deleted!"
    });
    document.location.replace("/");
  } else {
    await Toast.fire("Failed to delete collection!");
  }

};

const dialog = document.querySelector("#account-dialog");
const openDialogButton = document.querySelector("#open-dialog");
const closeDialogButton = document.querySelector("#cancel-delete");
openDialogButton.addEventListener("click", () => {
  dialog.showModal();
});
closeDialogButton.addEventListener("click", () => {
  dialog.close();
});

document
  .querySelector("#delete-account")
  .addEventListener("click", deleteAccount);

document
.querySelector("#delete-collection")
.addEventListener("click", deleteCollection);