# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from .base import BaseSerializer
from plane.db.models import IssueType


class WorkItemTypeSerializer(BaseSerializer):
    """Native Community work-item type representation used by DAC integrations."""

    class Meta:
        model = IssueType
        fields = [
            "id", "name", "description", "logo_props", "is_epic", "is_default",
            "is_active", "level", "external_source", "external_id", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class WorkItemTypeCreateUpdateSerializer(BaseSerializer):
    """Create/update the native IssueType model without commercial-only properties."""

    class Meta:
        model = IssueType
        fields = [
            "name", "description", "logo_props", "is_epic", "is_default",
            "is_active", "level", "external_source", "external_id",
        ]
