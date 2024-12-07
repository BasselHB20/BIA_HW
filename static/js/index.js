// ERROR ALERTS
const alertMessage = document.getElementById("alertMessage");
const alertText = document.getElementById("alertText");
const closeAlert = document.getElementById("closeAlert");

///////////////// Planes Page Logic ///////////////////////
document.addEventListener("DOMContentLoaded", function () {
  // Check Inputs In Planes Page
  const nextPlanesButton = document.getElementById("nextplanesButton");
  let planeCountInput1 = document.getElementById("planeCountInput");

  // Check Details Of Planes
  if (nextPlanesButton && planeCountInput1) {
      nextPlanesButton.addEventListener("click", function (e) {
          const planeCountValue = planeCountInput1.value.trim();

            // Hide Message
          alertMessage.classList.add('hidden');
          alertText.textContent = '';

          // Check If Input Is Empty Or Incorrect
          if (!planeCountValue || isNaN(planeCountValue) || parseInt(planeCountValue, 10) <= 0) {
              alertText.textContent = "Please enter a valid number of planes.";
              alertMessage.classList.remove('hidden');
              planeCountInput.focus();
              e.preventDefault();
              return;
          }

          // Check Details Of Planes
          let allValid = true;
          planes.forEach((plane, index) => {
              if (!plane.name.trim()) {
                  allValid = false;
                  alertText.textContent = `Please enter a valid name for Plane ${index + 1}.`;
                  alertMessage.classList.remove('hidden'); // Show Message
              }

              if (!plane.capacity || plane.capacity <= 0) {
                  allValid = false;
                  alertText.textContent = `Please enter a valid capacity for Plane ${index + 1}.`;
                  alertMessage.classList.remove('hidden'); // Show Message
              }
          });

          // if !allValid Check
          if (!allValid) {
              e.preventDefault();
              return;
          }
      });
  }
  
  // Close ERROR Message
  closeAlert.addEventListener('click', function () {
      alertMessage.classList.add('hidden');
  });

  // Hide Message In 5s
  setTimeout(function () {
      alertMessage.classList.add('hidden');
  }, 5000);
});

let currentPlaneCount = 0;
let planes = [];

window.onload = function () {
  const storedPlanes = sessionStorage.getItem("planes");
  if (storedPlanes) {
    planes = JSON.parse(storedPlanes);
    currentPlaneCount = planes.length;

    planes.forEach((plane) => {
      addPlaneElement(plane.index);
      const planeDiv = document.querySelector(`div[key='${plane.index}']`);
      planeDiv.querySelector('input[type="text"]').value = plane.name;
      planeDiv.querySelector('input[type="number"]').value = plane.capacity;
    });
  }
};

// Generate Inputs For The Planes
const planeCountInput = document.getElementById("planeCountInput");

if (planeCountInput)
document
  .getElementById("planeCountInput")
  .addEventListener("input", function () {
    const desiredCount = parseInt(this.value, 10) || 0;

    if (desiredCount > currentPlaneCount) {
      for (let i = currentPlaneCount; i < desiredCount; i++) {
        currentPlaneCount++;
        addPlaneElement(currentPlaneCount);
      }
    } else if (desiredCount < currentPlaneCount) {
      for (let i = currentPlaneCount; i > desiredCount; i--) {
        removePlaneElement(i);
        currentPlaneCount--;
      }
    }
  });

function addPlaneElement(index) {
  const linesContainer = document.getElementById("linesContainer");

  const planeDiv = document.createElement("div");
  planeDiv.className =
    "border rounded p-1 mb-2 flex max-md:flex-col max-md:gap-3 max-md:justify-center items-center lg:flex-row flex-col  gap-3 items-center justify-between";
  planeDiv.setAttribute("key", index);

  const heading = document.createElement("h3");
  heading.className =
    "text-purple-700 bg-gray-300 w-fit p-2 rounded text-center font-semibold";
  heading.textContent = `Plane ${index}`;

  const planeNameInput = document.createElement("input");
  planeNameInput.type = "text";
  planeNameInput.className = "mx-2 outline-none rounded px-2";
  planeNameInput.placeholder = "Enter plane name";

  const planeNameLabel = document.createElement("label");
  planeNameLabel.className = "ml-3 font-semibold";
  planeNameLabel.textContent = "Plane Name: ";
  planeNameLabel.appendChild(planeNameInput);

  const planeCapacityInput = document.createElement("input");
  planeCapacityInput.type = "number";
  planeCapacityInput.className = "mx-2 outline-none rounded px-2";
  planeCapacityInput.placeholder = "Enter capacity";

  const planeCapacityLabel = document.createElement("label");
  planeCapacityLabel.className = "font-semibold";
  planeCapacityLabel.textContent = "Plane Capacity: ";
  planeCapacityLabel.appendChild(planeCapacityInput);

  planeDiv.appendChild(heading);
  planeDiv.appendChild(planeNameLabel);
  planeDiv.appendChild(planeCapacityLabel);

  linesContainer.appendChild(planeDiv);

  planes.push({ index, name: "", capacity: 0 });

  planeNameInput.addEventListener("input", function () {
    planes[index - 1].name = this.value;
  });

  planeCapacityInput.addEventListener("input", function () {
    planes[index - 1].capacity = parseInt(this.value, 10) || 0;
  });
}

function removePlaneElement(index) {
  const linesContainer = document.getElementById("linesContainer");
  const planeDiv = linesContainer.querySelector(`div[key='${index}']`);
  if (planeDiv) {
    linesContainer.removeChild(planeDiv);
    planes.splice(index - 1, 1);
    for (let i = index - 1; i < planes.length; i++) {
      planes[i].index--;
    }
  }
}

// Get Planes From HTML Page
function navigateToShipmentsPage() {
  if (planes.length === 0) return;
  for (let i = 0; i < planes.length; i++) {
    if (!planes[i].name || !planes[i].capacity) return;
  }

  // Send Data To Server With Fetch
  fetch('/get_plane', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(planes)
  })
  .then(response => {
      if (response.ok) {
          return response.json();
      } else {
          console.error("Failed to submit data");
      }
  })
  .then(data => {
      console.log("Processed data from server:", data);
      if (data.success) {
          window.location.assign("/shipment_page"); // Move to shipment_page
      } else {
          console.error("Error from server:", data.error);
      }
  })
  .catch(error => {
      console.error("Error:", error);
  });
}


////////////////// SHIPMENT LOGIC //////////////////
let currentShipmentCount = 0;
let shipments = [];
const nextShipmentButton = document.getElementById("nextshipmentButton");
const shipmentCountInput = document.getElementById("shipmentCountInput");

document.addEventListener("DOMContentLoaded", function () {
  document
  .getElementById("shipmentCountInput")
  .addEventListener("input", function () {
    const desiredCount = parseInt(this.value, 10) || 0;

    if (desiredCount > currentShipmentCount) {
      for (let i = currentShipmentCount; i < desiredCount; i++) {
        currentShipmentCount++;
        addShipmentElement(currentShipmentCount);
      }
    } else if (desiredCount < currentShipmentCount) {
      for (let i = currentShipmentCount; i > desiredCount; i--) {
        removeShipmentElement(i);
        currentShipmentCount--;
      }
    }
  });

  // Check Details Of Shipments
  if (nextShipmentButton && shipmentCountInput) {
    nextShipmentButton.addEventListener("click", function (e) {
      const shipmentCountValue = shipmentCountInput.value.trim();

          // Hide Message
          alertMessage.classList.add('hidden');
          alertText.textContent = '';

          // Check If Input Is Empty Or Incorrect
      if (!shipmentCountValue || isNaN(shipmentCountValue) || parseInt(shipmentCountValue, 10) <= 0) {
        alertText.textContent ="Please enter a valid number of shipments.";
        alertMessage.classList.remove('hidden');
        shipmentCountInput.focus();
        e.preventDefault();
        return;
      }

      // Check Details Of Shipment
      let allValid = true;
      shipments.forEach((shipment, index) => {
        if (!shipment.name.trim()) {
          allValid = false;
          alert(`Please enter a valid name for Shipment ${index + 1}.`);
        }

        if (!shipment.weight || shipment.weight <= 0) {
          allValid = false;
          alert(`Please enter a valid weight for Shipment ${index + 1}.`);
        }

        if (!shipment.destination.trim()) {
          allValid = false;
          alert(`Please enter a valid destination for Shipment ${index + 1}.`);
        }
      });

      if (!allValid) {
        e.preventDefault();
        return;
      }
    });
  }
});


function addShipmentElement(index) {
  const shipmentsContainer = document.getElementById("shipmentsContainer");

  const shipmentDiv = document.createElement("div");
  shipmentDiv.className =
    "border rounded p-1 mb-2 flex lg:flex-row flex-col  gap-3 items-center justify-between ";
  shipmentDiv.setAttribute("key", index);

  const heading = document.createElement("h3");
  heading.className =
    "text-purple-700 bg-gray-300 w-fit p-2 rounded flex justify-center";
  heading.textContent = `Shipment ${index}`;

  const shipmentNameInput = createInput(
    "text",
    "Enter shipment name",
    "mx-2 mt-1 outline-none rounded px-2 w-60"
  );

  const shipmentWeightInput = createInput(
    "number",
    "Enter weight",
    "mx-2 mt-1 outline-none rounded px-2 w-40"
  );

  const shipmentCostInput = createInput(
    "number",
    "Enter cost",
    "mx-2 mt-1 outline-none rounded px-2 w-40"
  );

  const citySelect = document.createElement("select");
  citySelect.className =
    "text-purple-700 bg-gray-300 w-fit p-2 rounded outline-none";
  citySelect.innerHTML = `
        <option class="hidden" value="">Select City</option>
        <option value="Homs">Homs</option>
        <option value="Aleppo">Aleppo</option>
        <option value="Hama">Hama</option>
        <option value="Latakia">Latakia</option>
        <option value="Tartus">Tartus</option>
        <option value="Idlib">Idlib</option>
        <option value="Deir ez-Zor">Deir ez-Zor</option>
        <option value="Daraa">Daraa</option>
        <option value="As-Suwayda">As-Suwayda</option>
    `;
  citySelect.style.display = "none";

  shipmentDiv.appendChild(heading);
  shipmentDiv.appendChild(createLabel("Shipment Name:", shipmentNameInput));
  shipmentDiv.appendChild(createLabel("Shipment Weight:", shipmentWeightInput));
  shipmentDiv.appendChild(createLabel("Shipment Cost:", shipmentCostInput));
  shipmentDiv.appendChild(citySelect);

  shipmentsContainer.appendChild(shipmentDiv);

  shipments.push({ index, name: "", weight: 0, cost: 0, city: "" });

  const inputs = [shipmentNameInput, shipmentWeightInput, shipmentCostInput];

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      handleInputChange(
        index,
        shipmentNameInput.value,
        shipmentWeightInput.value,
        shipmentCostInput.value
      );
      citySelect.style.display = inputs.every((input) => input.value)
        ? "block"
        : "none";
    });
  });

  citySelect.addEventListener("change", function () {
    shipments[index - 1].city = this.value;
  });
}

function handleInputChange(index, name, weight, cost) {
  const shipment = shipments[index - 1];
  shipment.name = name;
  shipment.weight = weight ? parseFloat(weight) : 0;
  shipment.cost = cost ? parseFloat(cost) : 0;
}

function createInput(type, placeholder, className) {
  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  input.className = className;
  return input;
}

function createLabel(text, input) {
  const label = document.createElement("label");
  label.className = "ml-3";
  label.innerText = text;
  label.appendChild(input);
  return label;
}

function removeShipmentElement(index) {
  const shipmentsContainer = document.getElementById("shipmentsContainer");
  const shipmentDiv = shipmentsContainer.querySelector(`div[key='${index}']`);

  if (shipmentDiv) {
    shipmentsContainer.removeChild(shipmentDiv);
    shipments.splice(index - 1, 1);

    for (let i = index - 1; i < shipments.length; i++) {
      shipments[i].index--;
    }
  }
}

// Send shipments To server
function navigateToResultsPage() {
  if (shipments.length === 0) {
    alertText.textContent = "Please enter a valid number of Shipment.";
    alertMessage.classList.remove('hidden'); // Show Check Message
    return;
  }

  for (let i = 0; i < shipments.length; i++) {
    if (
      !shipments[i].name ||
      !shipments[i].weight ||
      !shipments[i].cost ||
      !shipments[i].city
    ) {
       alertText.textContent ="Please enter a valid data for Shipment";
       alertMessage.classList.remove('hidden'); // Show message
      return;
    }
  }

  // Hide Message
  alertMessage.classList.add('hidden');
  alertText.textContent = '';

  // Close ERROR Message
  closeAlert.addEventListener('click', function () {
    alertMessage.classList.add('hidden');
  });

  // Hide Message In 5s
  setTimeout(function () {
    alertMessage.classList.add('hidden');
  }, 5000);

  // Send Data To Server With Fetch
  fetch('/shipment_page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ shipments: shipments })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to submit data: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log("Processed shipments data from server:", data);
    if (data.success) {
      citypage(data.cities);
    } else {
      console.error("Error from server:", data.error);
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("Error from server: please enter correct data " + error.message);
  });
}

// Function to process and pass the shipments' cities
function citypage(cities) {
  fetch('/city_page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cities: cities }) // Send to Flask file
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to send cities: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log("Response from Flask:", data); // Print the returned data from Flask file
    if (data.success) {
      localStorage.setItem('best_route', JSON.stringify(data.best_route));
      localStorage.setItem('best_distance', data.best_distance);
      window.location.assign("/result_page"); // Then direct the user to result page and display the final result
    } else {
      console.error("Error from Flask:", data.error);
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("Error connecting to the server when sending cities: " + error.message);
  });
}
