///////////////// planes page logic ///////////////////////

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

// planes number //////////////////////////////////////////////////////////////////////
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

// Get planes from html page
function navigateToShipmentsPage() {
  if (planes.length === 0) return; // إذا كانت قائمة الطائرات فارغة
  for (let i = 0; i < planes.length; i++) {
    if (!planes[i].name || !planes[i].capacity) return; // إذا كانت البيانات غير مكتملة
  }
  // إرسال البيانات إلى الخادم عبر fetch
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
          // إذا كانت العملية ناجحة، يتم التحويل إلى صفحة الشحنات
          window.location.assign("/templates/shipment.html"); // رابط صفحة الشحنات
      } else {
          console.error("Error from server:", data.error);
      }
  })
  .catch(error => {
      console.error("Error:", error);
  });
}


////////////////// shipment logic //////////////////

let currentShipmentCount = 0;
let shipments = [];

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

function addShipmentElement(index) {
  const shipmentsContainer = document.getElementById("shipmentsContainer");

  const shipmentDiv = document.createElement("div");
  shipmentDiv.className =
    "border rounded p-1 mb-2 flex lg:flex-row flex-col  gap-3 items-center justify-between ";
  shipmentDiv.setAttribute("key", index);

  const heading = document.createElement("h3");
  heading.className =
    "text-purple-700 bg-gray-300 w-fit p-2 rounded flex justify-center";
  heading.textContent = `Shipment${index}`;

  const shipmentNameInput = createInput(
    "text",
    "Enter shipment name",
    "mx-2 mt-1 outline-none rounded px-2 w-40"
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

// إرسال الشحنات إلى الخادم
function navigateToResultsPage() {
  if (shipments.length === 0) {
    alert("لا توجد شحنات لإرسالها.");  // رسالة للمستخدم إذا كانت الشحنات فارغة
    return;
  }

  for (let i = 0; i < shipments.length; i++) {
    if (
      !shipments[i].name ||
      !shipments[i].weight ||
      !shipments[i].cost ||
      !shipments[i].city
    ) {
      alert("يرجى ملء جميع بيانات الشحنات.");  // رسالة للمستخدم إذا كانت البيانات غير مكتملة
      return;
    }
  }

  // إرسال البيانات إلى الخادم عبر fetch
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
    alert("خطأ في الاتصال بالخادم: " + error.message);
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