const input = document.getElementById('input-value');
const inputVisualizer = document.getElementById('input-visualizer');
const outputVisualizer = document.getElementById('output-visualizer');
let arr = [];

function handleAdd() {
  let value = input.value.trim();
  if (value === "" || isNaN(value)) {
    showToast("Please enter a valid number");
    return;
  }

  value = parseInt(value, 10);

  if (value < 0 || value > 999) {
    showToast("Please enter a number between 0 and 999");
    return;
  }

  const barHeight = Math.max(30, value / 2); // Ensure minimum height of 30px
  
  const node = document.createElement("div");
  node.classList.add("bar");
  node.style.height = `${barHeight}px`;
  node.innerText = value;
  
  // Add animation when adding new bar
  node.style.transform = "scale(0)";
  inputVisualizer.appendChild(node);
  
  // Animate the appearance
  setTimeout(() => {
    node.style.transform = "scale(1)";
  }, 10);
  
  arr.push(value);
  input.value = "";
  input.focus();
}

function handleReset() {
  if (arr.length === 0) {
    showToast("Nothing to reset");
    return;
  }
  
  // Add animation when resetting
  const bars = document.querySelectorAll('.bar');
  bars.forEach((bar, index) => {
    bar.style.transform = "scale(0)";
    bar.style.transitionDelay = `${index * 50}ms`;
  });
  
  setTimeout(() => {
    inputVisualizer.innerHTML = '';
    outputVisualizer.innerHTML = '';
    arr = [];
  }, bars.length * 50);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleSort() {
  if (arr.length === 0) {
    showToast("Please add some numbers first");
    return;
  }
  
  if (arr.length === 1) {
    showToast("Only one number - already sorted!");
    return;
  }
  
  outputVisualizer.innerHTML = '';
  let bars = document.querySelectorAll('.bar');
  
  // Add initial state to output
  await displaySortingStep();
  
  for (let i = 0; i < arr.length - 1; i++) {
    let min = i;
    bars[i].style.backgroundColor = '#ffcc00';
    
    for (let j = i + 1; j < arr.length; j++) {
      bars[j].style.backgroundColor = '#ff5733';
      await sleep(500);
      
      if (arr[j] < arr[min]) {
        if (min !== i) bars[min].style.backgroundColor = '#40c896';
        min = j;
        bars[min].style.backgroundColor = '#e6852c';
      } else {
        bars[j].style.backgroundColor = '#40c896';
      }
    }
    
    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      await animateSwap(bars[i], bars[min]);
      bars[i].innerText = arr[i];
      bars[min].innerText = arr[min];
      
      // Update heights after swap
      bars[i].style.height = `${Math.max(30, arr[i] / 2)}px`;
      bars[min].style.height = `${Math.max(30, arr[min] / 2)}px`;
    }
    
    bars[i].style.backgroundColor = '#40c896';
    await displaySortingStep();
  }
  
  bars[arr.length - 1].style.backgroundColor = '#40c896';
  await displaySortingStep();
  
  showToast("Sorting completed!", "success");
}

async function animateSwap(bar1, bar2) {
  return new Promise((resolve) => {
    bar1.style.transform = 'translateY(-20px)';
    bar2.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      // Swap positions in DOM
      const temp = bar1.style.order;
      bar1.style.order = bar2.style.order;
      bar2.style.order = temp;
      
      setTimeout(() => {
        bar1.style.transform = 'translateY(0)';
        bar2.style.transform = 'translateY(0)';
        resolve();
      }, 300);
    }, 300);
  });
}

async function displaySortingStep() {
  const stepDiv = document.createElement('div');
  stepDiv.classList.add('step');
  
  arr.forEach((num) => {
    const span = document.createElement('span');
    span.innerText = num;
    stepDiv.appendChild(span);
  });
  
  outputVisualizer.appendChild(stepDiv);
  await sleep(800);
  
  // Auto-scroll to the bottom of the output visualizer
  outputVisualizer.scrollTop = outputVisualizer.scrollHeight;
}

function showToast(message, type = "error") {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Add CSS for toast notifications
const toastStyles = document.createElement('style');
toastStyles.textContent = `
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  transition: all 0.3s ease;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.toast-error {
  background-color: #e74c3c;
}

.toast-success {
  background-color: #2ecc71;
}
`;
document.head.appendChild(toastStyles);

// Add event listener for Enter key
input.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    handleAdd();
  }
});