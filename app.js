(() => {
	const storageKey = "murmur.profile.v1";
	const communityPosts = [
		{
			id: "theo-bookshop",
			engagementKey: "theo-bookshop",
			author: "Theo Park",
			handle: "@theopark",
			avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
			profileHref: "user-profile.html",
			text: "Found a little bookshop tucked behind the station. No sign, just a bell on the door and the smell of rain-soaked paper. Lost an hour among the bookshelves. #smalljoys",
			images: ["https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1100&q=85"],
			createdAt: "2026-10-16T10:42:00.000Z",
			likes: 38,
			liked: false,
			comments: [{ author: "June Kim", text: "I know the one! Their poetry shelf is lovely." }]
		},
		{
			id: "june-market",
			author: "June Kim",
			handle: "@junebug",
			avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&q=80",
			text: "Sunday market haul: the wonkiest tomatoes, basil that smells like summer, and a tiny bunch of dahlias that absolutely did not fit in my tote. Worth it. #smalljoys",
			images: [
				"https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=85",
				"https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=700&q=85"
			],
			createdAt: "2026-10-16T09:18:00.000Z",
			likes: 112,
			liked: false,
			comments: [{ author: "Theo Park", text: "Those tomatoes are perfect." }]
		},
		{
			id: "sam-gentle-morning",
			author: "Sam Rivera",
			handle: "@samrivera",
			avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&q=80",
			text: "Reminder to drink a glass of water before your next coffee. A very small act of kindness, from me to you. #gentlerdays",
			images: [],
			createdAt: "2026-10-16T07:35:00.000Z",
			likes: 24,
			liked: false,
			comments: []
		}
	];
	const defaultProfile = {
		displayName: "Avery Lane",
		bio: "Collecting little moments, good sentences & places with really good pastries.",
		avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=85",
		banner: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85",
		followingCount: 482,
		followedUsers: [],
		followerCounts: { theo: 2400 },
		likes: {},
		communityPosts: [],
		posts: []
	};

	function readProfile() {
		try {
			const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
			return {
				...defaultProfile,
				...saved,
				followedUsers: Array.isArray(saved.followedUsers) ? saved.followedUsers : [],
				followerCounts: { ...defaultProfile.followerCounts, ...saved.followerCounts },
				likes: saved.likes && typeof saved.likes === "object" ? saved.likes : {},
				communityPosts: Array.isArray(saved.communityPosts) && saved.communityPosts.length
					? saved.communityPosts
					: communityPosts.map((post) => ({ ...post, comments: post.comments.map((comment) => ({ ...comment })) })),
				posts: Array.isArray(saved.posts) ? saved.posts : []
			};
		} catch {
			return { ...defaultProfile, followedUsers: [], followerCounts: { ...defaultProfile.followerCounts } };
		}
	}

	let profile = readProfile();

	function saveProfile() {
		try {
			localStorage.setItem(storageKey, JSON.stringify(profile));
			return true;
		} catch {
			return false;
		}
	}

	function setStatus(message) {
		const status = document.querySelector("[data-profile-status]");
		if (status) status.textContent = message;
	}

	function formatPostTime(value) {
		const date = new Date(value);
		const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
		if (minutes < 1) return "now";
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h`;
		return `${Math.floor(hours / 24)}d`;
	}

	function createPostCard(post, isOwnProfile) {
		const article = document.createElement("article");
		article.className = isOwnProfile ? "post profile-post" : "post";
		article.dataset.postId = post.id;

		const header = document.createElement("div");
		header.className = "post-header";
		const avatar = document.createElement("img");
		avatar.className = "avatar";
		avatar.src = post.avatar || profile.avatar;
		avatar.alt = post.author || profile.displayName;
		const byline = document.createElement("div");
		byline.className = "post-byline";
		const author = document.createElement("a");
		author.className = "display-name";
		author.href = post.profileHref || (post.author === profile.displayName ? "profile.html" : "#");
		author.textContent = post.author || profile.displayName;
		const handle = document.createElement("span");
		handle.className = "handle";
		handle.textContent = post.handle || "@averylane";
		const dot = document.createElement("span");
		dot.className = "post-dot";
		dot.textContent = "·";
		const time = document.createElement("time");
		time.dateTime = post.createdAt;
		time.textContent = formatPostTime(post.createdAt);
		byline.append(author, handle, dot, time);
		header.append(avatar, byline);
		article.append(header);

		const content = document.createElement("div");
		content.className = "post-content";
		if (post.text) {
			const paragraph = document.createElement("p");
			paragraph.textContent = post.text;
			content.append(paragraph);
		}
		if (post.images.length === 1) {
			const image = document.createElement("img");
			image.className = "post-image";
			image.src = post.images[0];
			image.alt = "Image attached to post";
			content.append(image);
		} else if (post.images.length > 1) {
			const grid = document.createElement("div");
			grid.className = "photo-grid new-post-image-grid";
			grid.setAttribute("aria-label", `${post.images.length} images attached to post`);
			post.images.forEach((source, index) => {
				const image = document.createElement("img");
				image.src = source;
				image.alt = `Image ${index + 1} attached to post`;
				grid.append(image);
			});
			content.append(grid);
		}
		article.append(content);

		const actions = document.createElement("div");
		actions.className = "post-actions";
		const like = document.createElement("button");
		const savedEngagement = post.engagementKey ? profile.likes[post.engagementKey] : null;
		const initialLiked = savedEngagement ? Boolean(savedEngagement.liked) : Boolean(post.liked);
		const initialLikes = savedEngagement ? savedEngagement.count : Number(post.likes) || 0;
		like.className = `action-link post-like-action${initialLiked ? " is-liked" : ""}`;
		like.type = "button";
		like.setAttribute("aria-label", initialLiked ? "Unlike post" : "Like post");
		like.setAttribute("aria-pressed", String(initialLiked));
		const heart = document.createElement("span");
		heart.className = "heart";
		heart.setAttribute("aria-hidden", "true");
		heart.textContent = initialLiked ? "♥" : "♡";
		const likeCount = document.createElement("span");
		likeCount.textContent = String(initialLikes);
		like.append(heart, likeCount);
		like.addEventListener("click", () => {
			const previousLiked = initialLiked;
			const previousLikes = initialLikes;
			const nextLiked = !previousLiked;
			const nextLikes = Math.max(0, previousLikes + (nextLiked ? 1 : -1));
			if (post.engagementKey) {
				profile.likes[post.engagementKey] = { liked: nextLiked, count: nextLikes };
			} else {
				post.liked = nextLiked;
				post.likes = nextLikes;
			}
			if (!saveProfile()) {
				if (post.engagementKey) profile.likes[post.engagementKey] = { liked: previousLiked, count: previousLikes };
				else {
					post.liked = previousLiked;
					post.likes = previousLikes;
				}
				return;
			}
			renderProfile();
		});

		const commentLink = document.createElement("a");
		commentLink.className = "action-link comment-count-link";
		commentLink.href = `#comments-${post.id}`;
		const commentIcon = document.createElement("span");
		commentIcon.setAttribute("aria-hidden", "true");
		commentIcon.textContent = "◷";
		const commentCount = document.createElement("span");
		commentCount.textContent = String(post.comments.length);
		commentLink.append(commentIcon, commentCount);
		actions.append(like, commentLink);
		article.append(actions);

		const comments = document.createElement("details");
		comments.className = "comments";
		comments.id = `comments-${post.id}`;
		comments.open = post.comments.length > 0;
		const summary = document.createElement("summary");
		summary.textContent = post.comments.length ? `View ${post.comments.length} replies` : "Write the first reply";
		comments.append(summary);
		if (post.comments.length) {
			const replies = document.createElement("div");
			replies.className = "post-reply-list";
			post.comments.forEach((comment) => {
				const reply = document.createElement("div");
				reply.className = "comment-preview";
				const replyAvatar = document.createElement("img");
				replyAvatar.className = "tiny-avatar";
				replyAvatar.src = comment.avatar || profile.avatar;
				replyAvatar.alt = "";
				const replyText = document.createElement("p");
				const replyAuthor = document.createElement("strong");
				replyAuthor.textContent = comment.author || profile.displayName;
				replyText.append(replyAuthor, document.createTextNode(comment.text));
				reply.append(replyAvatar, replyText);
				replies.append(reply);
			});
			comments.append(replies);
		}
		const replyForm = document.createElement("form");
		replyForm.className = "comment-form";
		const replyInput = document.createElement("input");
		replyInput.type = "text";
		replyInput.maxLength = 500;
		replyInput.placeholder = "Write a reply…";
		replyInput.setAttribute("aria-label", "Write a reply");
		replyInput.required = true;
		const replyButton = document.createElement("button");
		replyButton.type = "submit";
		replyButton.setAttribute("aria-label", "Send reply");
		replyButton.textContent = "↗";
		replyForm.append(replyInput, replyButton);
		replyForm.addEventListener("submit", (event) => {
			event.preventDefault();
			const text = replyInput.value.trim();
			if (!text) return;
			post.comments.push({ author: profile.displayName, avatar: profile.avatar, text, createdAt: new Date().toISOString() });
			if (!saveProfile()) {
				post.comments.pop();
				return;
			}
			renderProfile();
		});
		comments.append(replyForm);
		article.append(comments);
		return article;
	}

	function renderPosts() {
		document.querySelectorAll("[data-public-posts]").forEach((container) => {
			container.replaceChildren(...profile.posts.map((post) => createPostCard(post, false)));
		});
		document.querySelectorAll("[data-own-posts]").forEach((container) => {
			container.replaceChildren(...profile.posts.map((post) => createPostCard(post, true)));
		});
		document.querySelectorAll("[data-post-count]").forEach((element) => {
			element.textContent = String(128 + profile.posts.length);
		});
	}

	function searchVariants(term) {
		const variants = new Set([term]);
		if (term.length > 3 && term.endsWith("f")) variants.add(`${term.slice(0, -1)}ves`);
		if (term.length > 4 && term.endsWith("ves")) variants.add(`${term.slice(0, -3)}f`);
		if (term.length > 3 && term.endsWith("s")) variants.add(term.slice(0, -1));
		else if (term.length > 3) variants.add(`${term}s`);
		return [...variants].sort((first, second) => second.length - first.length);
	}

	function highlightMatches(container, terms) {
		if (!terms.length) return;
		const variants = [...new Set(terms.flatMap(searchVariants))];
		const escapedVariants = variants.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
		const expression = new RegExp(`\\b[\\w-]*(?:${escapedVariants.join("|")})[\\w-]*\\b`, "gi");
		const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
		const textNodes = [];
		while (walker.nextNode()) textNodes.push(walker.currentNode);
		textNodes.forEach((textNode) => {
			const text = textNode.nodeValue;
			if (!expression.test(text)) {
				expression.lastIndex = 0;
				return;
			}
			expression.lastIndex = 0;
			const fragment = document.createDocumentFragment();
			let cursor = 0;
			for (const match of text.matchAll(expression)) {
				fragment.append(document.createTextNode(text.slice(cursor, match.index)));
				const mark = document.createElement("mark");
				mark.className = "search-highlight";
				mark.textContent = match[0];
				fragment.append(mark);
				cursor = match.index + match[0].length;
			}
			fragment.append(document.createTextNode(text.slice(cursor)));
			textNode.replaceWith(fragment);
		});
	}

	function renderDiscovery() {
		const results = document.querySelector("[data-discover-results]");
		if (!results) return;
		const input = document.querySelector("[data-discover-search]");
		const query = input.value.trim().toLocaleLowerCase();
		const terms = query.split(/\s+/).filter(Boolean);
		const posts = [...profile.posts, ...profile.communityPosts].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
		const matches = posts.filter((post) => {
			if (!terms.length) return true;
			const searchableText = [post.author, post.handle, post.text, ...post.comments.map((comment) => comment.text)].join(" ").toLocaleLowerCase();
			return terms.every((term) => searchVariants(term).some((variant) => searchableText.includes(variant)));
		});
		const heading = document.querySelector("[data-discover-heading]");
		const count = document.querySelector("[data-discover-count]");
		if (heading) heading.textContent = query ? `Results for “${input.value.trim()}”` : "Trending posts";
		if (count) count.textContent = `${matches.length} ${matches.length === 1 ? "post" : "posts"}`;
		results.replaceChildren();
		matches.forEach((post) => {
			const card = createPostCard(post, false);
			if (terms.length) card.querySelectorAll(".post-content p").forEach((paragraph) => highlightMatches(paragraph, terms));
			results.append(card);
		});
		const emptyState = document.querySelector("[data-discover-empty]");
		if (emptyState) emptyState.hidden = matches.length > 0;
	}

	function renderStaticLikes() {
		document.querySelectorAll(".like-toggle").forEach((input) => {
			const label = input.nextElementSibling;
			const heart = label?.querySelector(".heart");
			const countElement = heart?.nextElementSibling;
			if (!countElement) return;

			const key = input.dataset.postKey || input.id;
			const count = Number.parseInt(countElement.textContent, 10) || 0;
			const state = profile.likes[key] || { liked: input.checked, count };
			profile.likes[key] = state;
			input.checked = Boolean(state.liked);
			input.setAttribute("aria-label", input.checked ? "Unlike post" : "Like post");
			label.setAttribute("aria-pressed", String(input.checked));
			countElement.textContent = String(state.count);
		});
	}

	function bindStaticLikes() {
		document.querySelectorAll(".like-toggle").forEach((input) => {
			input.addEventListener("change", () => {
				const label = input.nextElementSibling;
				const heart = label?.querySelector(".heart");
				const countElement = heart?.nextElementSibling;
				if (!countElement) return;

				const key = input.dataset.postKey || input.id;
				const previous = profile.likes[key] || {
					liked: !input.checked,
					count: Number.parseInt(countElement.textContent, 10) || 0
				};
				profile.likes[key] = {
					liked: input.checked,
					count: Math.max(0, previous.count + (input.checked ? 1 : -1))
				};
				if (!saveProfile()) {
					profile.likes[key] = previous;
					input.checked = previous.liked;
				}
				renderStaticLikes();
			});
		});
	}

	function renderProfile() {
		const name = profile.displayName || defaultProfile.displayName;
		document.querySelectorAll("[data-own-name]").forEach((element) => {
			element.textContent = name;
		});
		if (document.querySelector("#own-profile-name")) {
			document.querySelectorAll(".profile-post .post-byline .display-name").forEach((element) => {
				element.textContent = name;
			});
		}
		document.querySelectorAll("[data-own-bio]").forEach((element) => {
			element.textContent = profile.bio;
		});
		document.querySelectorAll("[data-own-avatar], .own-profile-page .profile-post .avatar, .own-profile-page .profile-large-avatar").forEach((image) => {
			image.src = profile.avatar;
			image.alt = name;
		});
		document.querySelectorAll("[data-own-banner]").forEach((image) => {
			image.src = profile.banner;
		});
		document.querySelectorAll("[data-following-count]").forEach((element) => {
			element.textContent = profile.followingCount.toLocaleString();
		});

		const nameInput = document.querySelector("#display-name");
		const bioInput = document.querySelector("#own-bio");
		if (nameInput) nameInput.value = name;
		if (bioInput) bioInput.value = profile.bio;

		document.querySelectorAll("[data-follow-user]").forEach((button) => {
			const isFollowing = profile.followedUsers.includes(button.dataset.followUser);
			button.textContent = isFollowing ? "✓ Following" : "＋ Follow";
			button.classList.toggle("is-following", isFollowing);
			button.setAttribute("aria-pressed", String(isFollowing));
		});
		document.querySelectorAll("[data-follower-count]").forEach((element) => {
			const count = profile.followerCounts[element.dataset.followerCount] ?? 0;
			element.textContent = count.toLocaleString();
		});
		renderStaticLikes();
		renderPosts();
		renderDiscovery();
	}

	function fileToImageData(file, maxDimension) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = () => reject(new Error("Could not read that image."));
			reader.onload = () => {
				const image = new Image();
				image.onerror = () => reject(new Error("That file is not a supported image."));
				image.onload = () => {
					const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
					const canvas = document.createElement("canvas");
					canvas.width = Math.round(image.width * scale);
					canvas.height = Math.round(image.height * scale);
					const context = canvas.getContext("2d");
					context.fillStyle = "#ffffff";
					context.fillRect(0, 0, canvas.width, canvas.height);
					context.drawImage(image, 0, 0, canvas.width, canvas.height);
					resolve(canvas.toDataURL("image/jpeg", 0.84));
				};
				image.src = reader.result;
			};
			reader.readAsDataURL(file);
		});
	}

	const editForm = document.querySelector(".profile-edit-form");
	if (editForm) {
		editForm.addEventListener("submit", (event) => {
			event.preventDefault();
			const nextName = document.querySelector("#display-name").value.trim();
			profile.displayName = nextName || defaultProfile.displayName;
			profile.bio = document.querySelector("#own-bio").value.slice(0, 200);
			setStatus(saveProfile() ? "Profile saved." : "Could not save. Try a smaller image or clear some browser storage.");
			renderProfile();
		});
	}

	const composerForm = document.querySelector(".composer form");
	if (composerForm) {
		const textInput = composerForm.querySelector("#post-text");
		const imageInput = composerForm.querySelector("#post-images");
		const characterCount = composerForm.querySelector("[data-char-count]");
		const status = composerForm.querySelector("[data-post-status]");
		const updateCharacterCount = () => {
			characterCount.textContent = `${textInput.value.length} / 800`;
		};
		textInput.addEventListener("input", updateCharacterCount);
		imageInput.addEventListener("change", () => {
			if (imageInput.files.length > 4) {
				imageInput.value = "";
				status.textContent = "Choose up to 4 images per post.";
				return;
			}
			status.textContent = imageInput.files.length ? `${imageInput.files.length} image${imageInput.files.length === 1 ? "" : "s"} ready to share.` : "";
		});
		composerForm.addEventListener("submit", async (event) => {
			event.preventDefault();
			const text = textInput.value.trim();
			const files = Array.from(imageInput.files).slice(0, 4);
			if (!text && files.length === 0) {
				status.textContent = "Write a note or add an image before sharing.";
				return;
			}
			const submitButton = composerForm.querySelector("button[type='submit']");
			submitButton.disabled = true;
			status.textContent = "Preparing your note…";
			try {
				const images = await Promise.all(files.map((file) => fileToImageData(file, 1280)));
				const post = {
					id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
					text,
					images,
					createdAt: new Date().toISOString(),
					likes: 0,
					liked: false,
					comments: []
				};
				profile.posts.unshift(post);
				if (!saveProfile()) {
					profile.posts.shift();
					status.textContent = "Could not save this post. Try fewer or smaller images.";
					return;
				}
				textInput.value = "";
				imageInput.value = "";
				updateCharacterCount();
				status.textContent = "Your note is shared.";
				renderProfile();
			} catch {
				status.textContent = "Could not load one of those images. Choose a different file.";
			} finally {
				submitButton.disabled = false;
			}
		});
	}

	const discoverSearch = document.querySelector("[data-discover-search]");
	if (discoverSearch) {
		discoverSearch.form?.addEventListener("submit", (event) => {
			event.preventDefault();
			renderDiscovery();
		});
		discoverSearch.addEventListener("input", renderDiscovery);
		document.querySelector("[data-discover-clear]")?.addEventListener("click", () => {
			discoverSearch.value = "";
			renderDiscovery();
			discoverSearch.focus();
		});
		document.querySelectorAll("[data-trending-query]").forEach((button) => {
			button.addEventListener("click", () => {
				discoverSearch.value = button.dataset.trendingQuery;
				renderDiscovery();
				discoverSearch.focus();
			});
		});
	}

	[
		{ id: "own-avatar", key: "avatar", maxDimension: 640, label: "Profile picture updated." },
		{ id: "own-banner", key: "banner", maxDimension: 1600, label: "Banner image updated." }
	].forEach(({ id, key, maxDimension, label }) => {
		const input = document.getElementById(id);
		if (!input) return;
		input.addEventListener("change", async () => {
			const [file] = input.files;
			if (!file) return;
			try {
				profile[key] = await fileToImageData(file, maxDimension);
				setStatus(saveProfile() ? label : "Could not save this image. Try a smaller file.");
				renderProfile();
			} catch {
				setStatus("Could not load that image. Choose a different file.");
			} finally {
				input.value = "";
			}
		});
	});

	document.querySelectorAll("[data-follow-user]").forEach((button) => {
		button.addEventListener("click", () => {
			const user = button.dataset.followUser;
			const wasFollowing = profile.followedUsers.includes(user);
			profile.followedUsers = wasFollowing
				? profile.followedUsers.filter((followedUser) => followedUser !== user)
				: [...profile.followedUsers, user];
			profile.followingCount = Math.max(0, profile.followingCount + (wasFollowing ? -1 : 1));
			profile.followerCounts[user] = Math.max(0, (profile.followerCounts[user] ?? 0) + (wasFollowing ? -1 : 1));
			const saved = saveProfile();
			renderProfile();
			button.setAttribute("title", saved ? "Follow state saved" : "Could not save follow state");
		});
	});

	window.addEventListener("storage", (event) => {
		if (event.key === storageKey) {
			profile = readProfile();
			renderProfile();
		}
	});

	bindStaticLikes();
	renderProfile();
})();