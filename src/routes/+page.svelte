<script>
  import { onMount } from 'svelte';
  import { t, locale } from 'svelte-i18n';
  import { LocalNotifications } from '@capacitor/local-notifications';
  import { Preferences } from '@capacitor/preferences'; // 引入安全的本地儲存

  // 狀態管理 
  let tasks =[]; 
  let editingId = null; 
  
  let taskName = '';
  let selectedDays = null; 
  let customDate = '';     
  let isTestMode = false; 

  const dayOptions =[1, 3, 7, 30, 90, 180, 360];

  // 精確計算本地時區的「今天」日期字串 (格式: YYYY-MM-DD)
  const getLocalToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  
  let minDateString = getLocalToday(); // 存入變數供 HTML 使用

  // 統一的時間格式化函數 (產出 YYYY-MM-DD HH:mm 24小時制)
  const formatDateTime = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${HH}:${min}`;
  };

  // 自訂彈窗狀態 (取代 alert 和 confirm)
  let modal = {
    isOpen: false,
    title: '',
    message: '',
    isConfirm: false, // true 代表是詢問框(有取消按鈕)，false 代表是提示框(只有確定)
    onConfirm: null   // 按下確定後要執行的動作
  };

  // 顯示提示框 (取代 alert)
  const showAlert = (title, message) => {
    modal = { isOpen: true, title, message, isConfirm: false, onConfirm: null };
  };

  // 顯示詢問框 (取代 confirm)
  const showConfirm = (title, message, onConfirmCallback) => {
    modal = { isOpen: true, title, message, isConfirm: true, onConfirm: onConfirmCallback };
  };

  // 關閉彈窗
  const closeModal = () => {
    modal.isOpen = false;
  };

  // 安全儲存函數 
  const saveTasksToStorage = async (newTasks) => {
    tasks = newTasks;
    await Preferences.set({ key: 'futurepin_tasks', value: JSON.stringify(tasks) });
  };

  // 初始化
  onMount(async () => {
    // 從底層安全讀取任務
    const { value } = await Preferences.get({ key: 'futurepin_tasks' });
    if (value) tasks = JSON.parse(value);

    // 請求通知權限
    try {
      await LocalNotifications.requestPermissions();
    } catch (e) {
      console.log("Web browser doesn't support notification permissions.");
    }

        // 建立「最高重要性」的通知頻道
    try {
      await LocalNotifications.createChannel({
        id: 'high_priority_channel',
        name: 'High Priority Reminders',
        description: 'Pops up on screen for urgent tasks',
        importance: 5, // 5 = MAX (最高級別，允許彈出橫幅和發出聲音)
        visibility: 1, // 1 = PUBLIC (鎖定螢幕時也能顯示)
        vibration: true
      });
    } catch (e) {
      console.log("Channel creation failed (maybe web browser)");
    }

  });

  // 輔助函數 
  const toggleLanguage = () => locale.set($locale === 'zh-TW' ? 'en' : 'zh-TW');

  const selectDays = (days) => {
    selectedDays = days;
    customDate = ''; 
    isTestMode = false;
  };

  const selectTestMode = () => {
    isTestMode = true;
    selectedDays = null;
    customDate = '';
  };

  const handleCustomDate = (e) => {
    customDate = e.target.value;
    selectedDays = null;
    isTestMode = false;
  };

  // 核心：儲存/更新任務
  const handleSave = async () => {
    if (!taskName.trim()) return showAlert($locale === 'zh-TW' ? '提示' : 'Notice', $locale === 'zh-TW' ? '請輸入名稱！' : 'Enter a name!');
    if (!selectedDays && !customDate && !isTestMode) return showAlert($locale === 'zh-TW' ? '提示' : 'Notice', $locale === 'zh-TW' ? '請選擇時間！' : 'Select a time!');

    let targetDate = new Date();
    const now = new Date(); // 取得當下時間

    if (isTestMode) {
      targetDate.setSeconds(targetDate.getSeconds() + 10); // 10秒後
    } else if (selectedDays) {
      targetDate.setDate(targetDate.getDate() + selectedDays);
    } else if (customDate) {
      const [year, month, day] = customDate.split('-');
      targetDate = new Date(year, month - 1, day, 9, 0, 0); // 預設早上 9:00
      
      // 新增：處理「今天」且 9:00 已經過去的情況
      if (targetDate.getTime() <= now.getTime()) {
        // 如果設定的時間比現在還早，自動改為「2 小時後」提醒
        targetDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      }
    }

    // 最終安全防線 (理論上上面處理完後不會再觸發這個)
    if (targetDate.getTime() <= now.getTime()) {
      return alert($locale === 'zh-TW' ? '不能設定過去的時間！' : 'Cannot set time in the past!');
    }

    // 將毫秒除以 1000 並取整數，確保它是一個符合 Android 限制的 32-bit 整數
    const taskId = editingId ? editingId : Math.floor(Date.now() / 1000);

    const newTask = {
      id: taskId,
      name: taskName,
      targetTime: targetDate.getTime(),
      displayTime: formatDateTime(targetDate)
    };

    try {
      if (editingId) {
        await LocalNotifications.cancel({ notifications: [{ id: editingId }] });
      }

      await LocalNotifications.schedule({
        notifications:[
          {
            title: ($locale === 'zh-TW' ? "⏰ 你標記的未來，現在到了。" : "⏰ The future you marked is now today."),
            body: taskName,
            id: taskId,
            schedule: { at: targetDate },
            sound: null, 
            channelId: 'high_priority_channel'
          }
        ]
      });

      // 更新陣列
      let updatedTasks = editingId 
        ? tasks.map(t => t.id === editingId ? newTask : t)
        : [...tasks, newTask];
      
      // --- 新增：依照目標時間 (targetTime) 由近到遠排序 ---
      updatedTasks.sort((a, b) => a.targetTime - b.targetTime);
      
      // 安全存檔
      await saveTasksToStorage(updatedTasks);

      // 清空表單
      taskName = '';
      selectedDays = null;
      customDate = '';
      isTestMode = false;
      editingId = null;

      showAlert($locale === 'zh-TW' ? '成功' : 'Success', $locale === 'zh-TW' ? '設定成功！' : 'Successfully set!');

    } catch (error) {
      console.error(error);
      alert('Failed to schedule notification.');
      // 網頁端測試用
      if(!editingId) { 
        await saveTasksToStorage([newTask, ...tasks]); 
      }
    }
  };

  // 核心：編輯任務
  const editTask = (task) => {
    taskName = task.name;
    editingId = task.id;
    selectedDays = null;
    customDate = '';
    isTestMode = false;
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // 核心：刪除任務
  const deleteTask = (id) => {
    // 呼叫自訂詢問框
    showConfirm(
      $locale === 'zh-TW' ? '刪除提醒' : 'Delete Reminder',
      $locale === 'zh-TW' ? '確定要刪除這個提醒嗎？' : 'Are you sure you want to delete this?',
      async () => {
        // 這裡放原本的刪除邏輯
        try {
          await LocalNotifications.cancel({ notifications:[{ id }] });
        } catch(e) { console.log("Cancel failed"); }

        const updatedTasks = tasks.filter(t => t.id !== id);
        await saveTasksToStorage(updatedTasks);
        
        if (editingId === id) {
          editingId = null;
          taskName = '';
        }
        closeModal(); // 執行完關閉彈窗
      }
    );
  };
  
</script>

<!-- 頂部導覽列 -->
<div class="sticky top-0 z-50 bg-[#F2F2F7]/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center mb-6">
  <div class="text-xl font-bold text-gray-800 tracking-tight">
    📌 {$t('app.title')}
  </div>
  <button class="native-btn px-3 py-1 text-sm rounded-lg" on:click={toggleLanguage}>
    🌐 {$t('app.lang_btn')}
  </button>
</div>

<main class="container mx-auto px-4 max-w-md pb-12">
  
  <!-- 1. 新增/編輯 區塊 -->
  <div class="native-card p-6 mb-8">
    <h2 class="text-lg font-bold text-gray-800 mb-4">
      {editingId ? $t('app.update_btn') : $t('app.save_btn')}
    </h2>
    
    <div class="mb-5">
      <label class="block text-sm font-semibold text-gray-600 mb-2 ml-1">{$t('app.task_name')}</label>
      <input type="text" bind:value={taskName} placeholder={$t('app.task_placeholder')} class="native-input" />
    </div>

    <div class="mb-5">
      <label class="block text-sm font-semibold text-gray-600 mb-2 ml-1">{$t('app.quick_select')}</label>
      <div class="flex flex-wrap gap-2">
        <!-- 10秒測試按鈕 -->
        <button class="native-btn px-3 py-2 text-sm {isTestMode ? 'native-btn-active' : ''}" on:click={selectTestMode}>
          ⏱️ {$t('app.test_10s')}
        </button>
        <!-- 天數按鈕 -->
        {#each dayOptions as days}
          <button class="native-btn px-3 py-2 text-sm {selectedDays === days ? 'native-btn-active' : ''}" on:click={() => selectDays(days)}>
            {days} {$t('app.days_later')}
          </button>
        {/each}
      </div>
    </div>

    <div class="mb-6">
      <label class="block text-sm font-semibold text-gray-600 mb-2 ml-1">{$t('app.custom_date')}</label>
      <input type="date" value={customDate} on:change={handleCustomDate} class="native-input" min={minDateString} />
    </div>

    <button class="w-full py-3.5 rounded-xl font-bold text-white text-lg transition-all active:scale-95 {editingId ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}" on:click={handleSave}>
      {editingId ? $t('app.update_btn') : $t('app.save_btn')}
    </button>
    
    {#if editingId}
      <button class="w-full mt-3 py-2 text-gray-500 text-sm font-medium" on:click={() => {editingId = null; taskName = '';}}>
        Cancel Edit
      </button>
    {/if}
  </div>

  <!-- 2. 任務列表 區塊 -->
  <div>
    <h3 class="text-md font-bold text-gray-500 mb-3 ml-1 uppercase tracking-wider">{$t('app.my_tasks')}</h3>
    
    {#if tasks.length === 0}
      <div class="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        {$t('app.no_tasks')}
      </div>
    {:else}
      <div class="space-y-3">
        {#each tasks as task (task.id)}
          <div class="native-card p-4 flex justify-between items-center">
            <div class="flex-1 overflow-hidden pr-4">
              <div class="font-bold text-gray-800 truncate text-lg">{task.name}</div>
              <div class="text-sm text-blue-500 font-medium mt-1">🔔 {task.displayTime}</div>
            </div>
            <div class="flex flex-col gap-2">
              <button class="native-btn px-3 py-1.5 text-xs text-gray-600" on:click={() => editTask(task)}>{$t('app.edit')}</button>
              <button class="native-btn px-3 py-1.5 text-xs text-red-500 border-red-100 bg-red-50" on:click={() => deleteTask(task.id)}>{$t('app.delete')}</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

</main>

<!-- 自訂彈窗 (Modal) -->
{#if modal.isOpen}
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
    <div class="bg-white rounded-3xl shadow-2xl w-11/12 max-w-sm overflow-hidden transform transition-all scale-100">
      <div class="p-6 text-center">
        <h3 class="text-xl font-bold text-gray-800 mb-2">{modal.title}</h3>
        <p class="text-gray-500 text-base">{modal.message}</p>
      </div>
      <div class="flex border-t border-gray-100">
        {#if modal.isConfirm}
          <button class="flex-1 py-4 text-gray-500 font-medium hover:bg-gray-50 transition-colors" on:click={closeModal}>
            {$locale === 'zh-TW' ? '取消' : 'Cancel'}
          </button>
          <div class="w-[1px] bg-gray-100"></div>
        {/if}
        <button 
          class="flex-1 py-4 text-blue-500 font-bold hover:bg-blue-50 transition-colors" 
          on:click={modal.isConfirm ? modal.onConfirm : closeModal}
        >
          {$locale === 'zh-TW' ? '確定' : 'OK'}
        </button>
      </div>
    </div>
  </div>
{/if}