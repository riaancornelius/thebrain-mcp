// src/handlers/app.js - Control the TheBrain desktop app (local API only)

export async function getAppState(api) {
  try {
    const state = await api.getAppState();

    return {
      success: true,
      state: {
        currentBrainId: state.currentBrainId,
        currentBrainName: state.currentBrainName,
        activeThoughtId: state.activeThoughtId,
        activeThoughtName: state.activeThoughtName,
        tabs: (state.tabs || []).map(tab => ({
          brainId: tab.brainId,
          brainName: tab.brainName,
          isActive: tab.isActive,
          activeThoughtId: tab.activeThoughtId,
          activeThoughtName: tab.activeThoughtName,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function openBrain(api, { brainId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    await api.openBrain(brainId);

    return {
      success: true,
      message: `Brain ${brainId} opened in TheBrain`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function closeBrain(api, { brainId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    await api.closeBrain(brainId);

    return {
      success: true,
      message: `Brain ${brainId} tab closed in TheBrain`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function activateThought(api, { brainId, thoughtId }) {
  try {
    if (!brainId || !thoughtId) {
      throw new Error('Brain ID and thought ID are required');
    }

    await api.activateThought(brainId, thoughtId);

    // The API returns 200 even for unknown thoughts, and the app updates its
    // active thought asynchronously, so poll the app state to confirm.
    let state;
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      state = await api.getAppState();
      if (state.activeThoughtId === thoughtId) {
        return {
          success: true,
          message: `Navigated TheBrain to "${state.activeThoughtName}"`,
          brainId,
          thoughtId,
          thoughtName: state.activeThoughtName,
        };
      }
    }

    return {
      success: false,
      error: `TheBrain accepted the request but is showing "${state.activeThoughtName}" in "${state.currentBrainName}", not thought ${thoughtId}. Check that the thought exists in brain ${brainId}.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
